    // SPDX-License-Identifier: MIT
    // Compatible with OpenZeppelin Contracts ^5.0.0
    pragma solidity ^0.8.19;

    import "@openzeppelin/contracts/access/Ownable.sol";
    import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
    import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
    import "../interfaces/IRedEnvelope.sol";
    import "../interfaces/ITaskControlDirect.sol";
    import "../interfaces/ItaskCallee.sol";

    contract TaskControlDirect is ITaskControlDirect,ReentrancyGuard, Ownable {
        address public redEnvelopeAddr;
        bool public allowBuyTicket;
        bool public allowSendTicket;
        uint public decimals;

        mapping(address => uint256) private _tasks;     //记录任务及权重

        event TaskAdd(address taskAddr,uint256 weight);

        constructor(address _redEnvelopeAddr,bool _allowBuyTicket,bool _allowSendTicket,uint _decimals)
            Ownable(address(msg.sender))
        {
            //_mint(msg.sender, 10000 * 10 ** decimals());
            redEnvelopeAddr = _redEnvelopeAddr;
            allowBuyTicket = _allowBuyTicket;
            allowSendTicket = _allowSendTicket;
            decimals = _decimals;
        }

        //设置任务及权重，若权重为0，则等同删除任务
        function setTask(address _taskAddr,uint256 _weight)external onlyOwner{
            _tasks[_taskAddr] = _weight;
            emit TaskAdd(_taskAddr, _weight);
        }

        function _getTicket(uint256 _id,address _receiveAddress,uint256 _ticketNumbers)internal returns(bool){
            bool buy = true;
            RedEnvelope memory redEnvelope = IRedEnvelope(redEnvelopeAddr).viewRedEnvelope(_id);
            if (redEnvelope.sendAllowAddr == address(0)){      
                require(allowBuyTicket == true, "buy ticket no allow");
                uint256 approveAmount = redEnvelope.ticketPirce * _ticketNumbers;
                IERC20(redEnvelope.ticketToken).approve(redEnvelopeAddr,approveAmount);       
                IRedEnvelope(redEnvelopeAddr).buyTickets(_id,_receiveAddress,_ticketNumbers);
            }else{
                require(allowSendTicket == true, "send ticket no allow");                
                IRedEnvelope(redEnvelopeAddr).sendTickets(_id,_receiveAddress,_ticketNumbers);
                buy = false;
            }
            return buy;
        }

        function getTicket(uint256 _id,address _taskAddr,address _receiveAddress,bytes calldata _data)virtual override external{
            require(_tasks[_taskAddr] != 0,"no set as task");
            //实际获取ticket数为runTask返回值*权重/price
            uint256 ticketNumbers = ItaskCallee(_taskAddr).taskCall(address(msg.sender),_data) * _tasks[_taskAddr] / (10 ** decimals) ;
            require(ticketNumbers != 0,"ticketNumbers no zero");
            bool buy = _getTicket(_id,_receiveAddress,ticketNumbers);
            emit TicketGet(_id,_taskAddr,address(msg.sender), _receiveAddress,ticketNumbers,buy);
        }

        //提取第三方代币
        function withdraw(address _token,address _to,uint256 _value)external onlyOwner{
            IERC20(_token).transfer(_to,_value);
        }
    }