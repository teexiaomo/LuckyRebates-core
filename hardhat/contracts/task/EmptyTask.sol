// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.19;

import "../interfaces/ItaskCallee.sol";

//若taskControl注册该合约，任何人都可以领取task token
contract EmptyTask is ItaskCallee{
    function taskCall(address sender,uint256 value,bytes calldata data) external pure returns(uint256){
        return value;
    }
}