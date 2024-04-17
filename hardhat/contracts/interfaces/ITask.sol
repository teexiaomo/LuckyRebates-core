// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.20;

interface Itask{
    //执行具体领取任务
    function runTask(address sender,uint256 value,bytes calldata data) external view returns(uint256);
}
