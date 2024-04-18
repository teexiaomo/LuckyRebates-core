    // SPDX-License-Identifier: MIT
    // Compatible with OpenZeppelin Contracts ^5.0.0
    pragma solidity ^0.8.20;

    import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
    import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
    import "@openzeppelin/contracts/access/Ownable.sol";
    import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
    import "./interfaces/IRedEnvelope.sol";
    import "./interfaces/ITaskControl.sol";
    import "./interfaces/ITask.sol";

    contract TaskControl is ITaskControl,ERC20,ReentrancyGuard, ERC20Burnable, Ownable {
        address public redEnvelopeAddr;
        bool public allowBuyTicket;
        bool public allowSendTicket;

        mapping(address => uint256) private _tasks;     //记录任务及权重

        event TaskAdd(address taskAddr,uint256 weight);

        constructor(address _redEnvelopeAddr,bool _allowBuyTicket,bool _allowSendTicket)
            ERC20("lotteryTicket", "Ticket")
            Ownable(address(msg.sender))
        {
            //_mint(msg.sender, 10000 * 10 ** decimals());
            redEnvelopeAddr = _redEnvelopeAddr;
            allowBuyTicket = _allowBuyTicket;
            allowSendTicket = _allowSendTicket;
        }

        function decimals() public view override virtual returns (uint8) {
            return 6;
        }

        //设置任务及权重，若权重为0，则等同删除任务
        function setTask(address _taskAddr,uint256 _weight)external onlyOwner{
            _tasks[_taskAddr] = _weight;
            emit TaskAdd(_taskAddr, _weight);
        }


        function mintToken(address _taskAddr,address _receiveAddress,uint256 _value,bytes calldata _data) external nonReentrant{
            require(_tasks[_taskAddr] != 0,"no set as task");

            //实际铸造token数为runTask返回值*权重
            uint256 amount = Itask(_taskAddr).runTask(address(msg.sender),_value,_data) * _tasks[_taskAddr];
            _mint(_receiveAddress, amount);
            emit TokenMint(address(msg.sender),_taskAddr,_receiveAddress,amount);
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

        function getTicket(uint256 _id,address _receiveAddress,uint256 _ticketNumbers)external{
            uint256 amount = _ticketNumbers * 10 ** decimals();
            burn(amount);
            bool buy = _getTicket(_id,_receiveAddress,_ticketNumbers);

            emit TicketGet(_id,address(msg.sender),_receiveAddress,amount,_ticketNumbers,buy);
        }
        function getTicketFrom(uint256 _id,address _fromAddress,address _receiveAddress,uint256 _ticketNumbers)external{
            uint256 amount = _ticketNumbers * 10 ** decimals();
            burnFrom(_fromAddress,amount);
            bool buy = _getTicket(_id,_receiveAddress,_ticketNumbers);

            emit TicketGet(_id,_fromAddress,_receiveAddress,amount,_ticketNumbers,buy);
        }

        //提取第三方代币
        function withdraw(address _token,address _to,uint256 _value)external onlyOwner{
            IERC20(_token).transfer(_to,_value);
        }
    }