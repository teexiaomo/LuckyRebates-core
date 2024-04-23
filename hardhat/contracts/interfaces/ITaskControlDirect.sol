    // SPDX-License-Identifier: MIT
    // Compatible with OpenZeppelin Contracts ^5.0.0
    pragma solidity ^0.8.19;

    interface ITaskControlDirect  {
        event TicketGet(uint256 id,address taskAddr, address fromAddress,address receiveAddress,uint256 ticketNumbers,bool buy);
        
        //执行任务，并领取指定红包的投注
        function getTicket(uint256 _id,address _taskAddr,address _receiveAddress,bytes calldata data)external;
    }