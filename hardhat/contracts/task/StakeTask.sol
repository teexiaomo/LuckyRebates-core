// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.19;

import "../interfaces/ItaskCallee.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

//若taskControl注册该合约，则通过该合约进行指定代币质押，质押一定时间后，提取时可领取task token
contract PayTask is ItaskCallee,Ownable{
    using SafeERC20 for IERC20;

    address public payToken;
    address public operatorAddress;
    uint256 public availableTime;

    mapping (address => uint256) _stakeNum;
    mapping (address => uint256) _stakeTime;
    
    constructor(address _payToken,address _operatorAddress,uint256 _availableTime)
            Ownable(address(msg.sender))
    {
        payToken = _payToken;
        operatorAddress = _operatorAddress;
        availableTime = _availableTime;
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

    function _deposit(address _sender,uint256 _amount) internal{
        IERC20(payToken).safeTransferFrom(_sender, address(this), _amount);
        _stakeNum[_sender] +=  _amount;
        _stakeTime[_sender] = block.timestamp;
    } 

    function deposit(uint256 _amount) external {
        require(_amount != 0 ,"deposit no zero");
        _deposit(msg.sender,_amount);

    }


    function depositFrom(address _sender,uint256 _amount)external{
        require(_amount != 0 ,"deposit no zero");
        _deposit(_sender,_amount);
    }


    function _withdraw(address _sender)internal returns(uint256){
        uint256 amount = _stakeNum[_sender];
        IERC20(payToken).safeTransfer(_sender, amount);
        if ((_stakeTime[_sender] + availableTime) <= block.timestamp){
            return amount;
        }
        return 0;
    }

    function withdraw() external{
        require(_stakeNum[msg.sender] != 0,"withdraw no zero");
        _withdraw(msg.sender);
    }
    
    function taskCall(address _sender,bytes calldata _data) external  onlyOperator returns(uint256){
        uint256 value = _withdraw(_sender);
        return value;
    }
}