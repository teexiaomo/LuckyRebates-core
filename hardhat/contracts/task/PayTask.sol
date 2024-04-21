// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.19;

import "../interfaces/ItaskCallee.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

//若taskControl注册该合约，则通过该合约发生转账行为都可以领取task token
contract PayTask is ItaskCallee,Ownable{
    using SafeERC20 for IERC20;
    address public payToken;
    address public targetAddress;
    address public operatorAddress;
    
    constructor(address _payToken,address _targetAddress,address _operatorAddress)
            Ownable(address(msg.sender))
    {
        payToken = _payToken;
        targetAddress = _targetAddress;
        operatorAddress = _operatorAddress;
    }
    modifier onlyOperator() {
        require(operatorAddress == msg.sender, "Not operator");
        _;
    }

    function setOperatorAddress(
        address _operatorAddress
    )external onlyOwner{
        require(_operatorAddress != address(0), "Cannot be zero address");
        operatorAddress = _operatorAddress;
    }
    
    function taskCall(address _sender,uint256 _value,bytes calldata _data) external  onlyOperator returns(uint256){
        IERC20(payToken).safeTransferFrom(_sender, targetAddress, _value);
        return _value;
    }
}