// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.19;

interface IRandomGenerator{
    //请求具体随机数
    function requestRandomWords(uint256 id)external;

    //查询随机数
    function getRandomWords(uint256 _id)external view returns(uint256[] memory randomWords);
}

