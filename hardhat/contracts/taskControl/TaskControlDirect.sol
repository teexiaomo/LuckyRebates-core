// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^4.0.0
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../interfaces/ITokenGift.sol";
import "../interfaces/ITaskControlDirect.sol";
import "../interfaces/ItaskCallee.sol";

contract TaskControlDirect is ITaskControlDirect,ReentrancyGuard, Ownable {
    ITokenGift tokenGift;
    bool public allowBuyTicket;
    bool public allowSendTicket;
    uint public decimals;

    mapping(address => uint256) private taskMap;     //记录任务及权重

    error NotAllowModel(uint256 id, ITokenGift.Model model);

    event TaskAdd(address taskAddr,uint256 weight);

    constructor(address _tokenGiftAddr,bool _allowBuyTicket,bool _allowSendTicket,uint _decimals)
        Ownable()
    {
        //_mint(msg.sender, 10000 * 10 ** decimals());
        tokenGift = ITokenGift(_tokenGiftAddr);
        allowBuyTicket = _allowBuyTicket;
        allowSendTicket = _allowSendTicket;
        decimals = _decimals;
    }

    //设置任务及权重，若权重为0，则等同删除任务
    function setTask(address _taskAddr,uint256 _weight)external onlyOwner{
        taskMap[_taskAddr] = _weight;
        emit TaskAdd(_taskAddr, _weight);
    }
    function getTask(address _taskAddr)external view  returns(uint256) {
        return taskMap[_taskAddr];
    }

    function _getTicket(uint256 _id,address _receiveAddress,uint256 _ticketNumbers)internal returns(bool){
        bool buy = true;

        if (tokenGift.viewTokenGiftModel(_id) == ITokenGift.Model.BuyModel){      
            if (allowBuyTicket != true){
                revert NotAllowModel(_id, tokenGift.viewTokenGiftModel(_id));
            }
            uint256 approveAmount = tokenGift.viewTokenGiftTicketPrice(_id) * _ticketNumbers;
            IERC20(tokenGift.viewTokenGiftTicketToken(_id)).approve(address(tokenGift),approveAmount);       
            tokenGift.buyTickets(_id,_receiveAddress,_ticketNumbers);
        }else{
            if (allowSendTicket != true){
                revert NotAllowModel(_id, tokenGift.viewTokenGiftModel(_id));
            }             
            tokenGift.sendTickets(_id,_receiveAddress,_ticketNumbers);
            buy = false;
        }
        return buy;
    }

    function getTicket(uint256 _id,address _taskAddr,address _receiveAddress,bytes calldata _data)virtual override external payable{
        require(taskMap[_taskAddr] != 0,"no set as task");

        uint256 value = ItaskCallee(_taskAddr).taskCall{value: msg.value}(address(msg.sender),_data);
    
        //实际获取ticket数为runTask返回值*权重/price
        uint256 ticketNumbers = value * taskMap[_taskAddr] / (10 ** decimals) ;
        require(ticketNumbers != 0,"ticketNumbers no zero");
        bool buy = _getTicket(_id,_receiveAddress,ticketNumbers);
        emit TicketGet(_id,_taskAddr,address(msg.sender), _receiveAddress,ticketNumbers,buy);
    }

    //提取第三方代币
    function withdraw(address _token,address _to,uint256 _value)external onlyOwner{
        IERC20(_token).transfer(_to,_value);
    }
}