// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IRedEnvelope.sol";

import "./TaskControlWithToken.sol";

contract TaskControlWithTokenOnlyBuy is TaskControlWithToken {
    using SafeERC20 for IERC20;
    address public ticketToken;
    uint256 public ticketPirce;
    address public reserveAddr;


    constructor(address _redEnvelopeAddr,address _ticketToken,address _reserveAddr,uint256 _ticketPirce)
        TaskControlWithToken(_redEnvelopeAddr,true,false)
    {
        ticketToken = _ticketToken;
        ticketPirce = _ticketPirce;
        reserveAddr = _reserveAddr;
    }

    function mintToken(address _taskAddr,address _receiveAddress,bytes calldata _data) external virtual override nonReentrant{
        require(this.getTask(_taskAddr) != 0,"no set as task");

        //实际铸造token数为runTask返回值*权重
        uint256 amount = ItaskCallee(_taskAddr).taskCall(address(msg.sender),_data) * this.getTask(_taskAddr);
        _mint(_receiveAddress, amount);

        //需要转入对应价值的红包token的保证金
        uint256 ticketAmount = amount * ticketPirce / (10 ** decimals());
        IERC20(ticketToken).safeTransferFrom(reserveAddr,address(this),ticketAmount);  
        emit TokenMint(address(msg.sender),_taskAddr,_receiveAddress,amount);
    }

    function _buyTicket(uint256 _id,address _receiveAddress,uint256 _ticketNumbers)internal{
        RedEnvelope memory redEnvelope = IRedEnvelope(redEnvelopeAddr).viewRedEnvelope(_id);
        require(redEnvelope.ticketToken == ticketToken,"ticketToken err.no suport RedEnvelope token");
        require(redEnvelope.ticketPirce == ticketPirce,"ticketPirce err.no suport RedEnvelope token");
        require(redEnvelope.sendAllowAddr == address(0),"only buy model");
        
        uint256 approveAmount = redEnvelope.ticketPirce * _ticketNumbers;
        IERC20(redEnvelope.ticketToken).approve(redEnvelopeAddr,approveAmount);       
        IRedEnvelope(redEnvelopeAddr).buyTickets(_id,_receiveAddress,_ticketNumbers);
    }



    function getTicket(uint256 _id,address _receiveAddress,uint256 _ticketNumbers)external virtual override{
        uint256 amount = _ticketNumbers * 10 ** decimals();
        burn(amount);
        _buyTicket(_id,_receiveAddress,_ticketNumbers);
        emit TicketGet(_id,address(msg.sender),_receiveAddress,amount,_ticketNumbers,true);
    }

    function getTicketFrom(uint256 _id,address _fromAddress,address _receiveAddress,uint256 _ticketNumbers)external virtual override{
        uint256 amount = _ticketNumbers * 10 ** decimals();
        burnFrom(_fromAddress,amount);
        _buyTicket(_id,_receiveAddress,_ticketNumbers);
        emit TicketGet(_id,_fromAddress,_receiveAddress,amount,_ticketNumbers,false);
    }

    //不允许提取保证金代币
    function withdraw(address _token,address _to,uint256 _value)external virtual override onlyOwner{
        //IERC20(_token).transfer(_to,_value);
    }
}