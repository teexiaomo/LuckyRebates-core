    // SPDX-License-Identifier: MIT
    // Compatible with OpenZeppelin Contracts ^5.0.0
    pragma solidity ^0.8.20;

    import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
    import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
    import "@openzeppelin/contracts/access/Ownable.sol";
    import "./interfaces/IRedEnvelope.sol";
    import "./interfaces/ITaskControl.sol";
    import "./interfaces/ITask.sol";

    contract TaskControl is ITaskControl,ERC20, ERC20Burnable, Ownable {
        address public redEnvelopeAddr;
        bool public allowBuyTicket;
        bool public allowSendTicket;

        mapping(address => uint256) private _tasks;     //记录任务及权重

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
            return 0;
        }

        //设置任务及权重
        function setTask(address _taskAddr,uint256 _weight)external onlyOwner{
            _tasks[_taskAddr] = _weight;
        }


        function mintToken(address _taskAddr,address _receiveAddress,uint256 _value,bytes calldata _data) external {
            require(_tasks[_taskAddr] != 0,"no set as task");

            uint256 amount = Itask(_taskAddr).runTask(address(msg.sender),_value,_data) * _tasks[_taskAddr];
            _mint(_receiveAddress, amount);
        }

        function _getTicket(uint256 _id,address _receiveAddress,uint256 _ticketNumbers)internal{
            RedEnvelope memory redEnvelope = IRedEnvelope(redEnvelopeAddr).viewRedEnvelope(_id);
            if (redEnvelope.sendAllowAddr == address(0)){      
                require(allowBuyTicket == true, "buy ticket no allow");
                uint256 approveAmount = redEnvelope.ticketPirce * _ticketNumbers;
                IERC20(redEnvelope.ticketToken).approve(redEnvelopeAddr,approveAmount);       
                IRedEnvelope(redEnvelopeAddr).buyTickets(_id,_receiveAddress,_ticketNumbers);
            }else{
                require(allowSendTicket == true, "send ticket no allow");                
                IRedEnvelope(redEnvelopeAddr).sendTickets(_id,_receiveAddress,_ticketNumbers);
            }
        }

        function getTicket(uint256 _id,address _receiveAddress,uint256 _ticketNumbers)external{
            burn(_ticketNumbers);
            _getTicket(_id,_receiveAddress,_ticketNumbers);
        }
        function getTicketFrom(uint256 _id,address _fromAddress,address _receiveAddress,uint256 _ticketNumbers)external{
            burnFrom(_fromAddress,_ticketNumbers);
            _getTicket(_id,_receiveAddress,_ticketNumbers);
        }

        //提取第三方代币
        function withdraw(address _token,address _to,uint256 _value)external onlyOwner{
            IERC20(_token).transfer(_to,_value);
        }
    }