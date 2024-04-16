// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "../interfaces/ITask.sol";

contract EmptyTask is Itask{
    function runTask(address sender,uint256 value,bytes calldata data) external  returns(uint256){
        return 1;
    }
}