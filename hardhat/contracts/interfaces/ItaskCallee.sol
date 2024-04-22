// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.19;

interface ItaskCallee{
    //执行具体领取任务
    function taskCall(address sender,bytes calldata data) external  returns(uint256);
}
