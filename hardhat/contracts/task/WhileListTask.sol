// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "../interfaces/ITask.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//若taskControl注册该合约，_whileListAddr中记录的地址都可以领取task token
contract WhileListTask is Itask,Ownable{
    mapping(address => bool) _whileListAddr;
    constructor(address[] memory _operatorAddressList)
            Ownable(address(msg.sender))
        {
            for(uint i = 0 ;i < _operatorAddressList.length;i++){
                require(_operatorAddressList[i] != address(0), "Cannot be zero address");
                _whileListAddr[_operatorAddressList[i]] = true;
            }
        }
    function setWhileListAddress(
        address _whileAddress,
        bool _opt
    )external onlyOwner{
        require(_whileAddress != address(0), "Cannot be zero address");
        _whileListAddr[_whileAddress] = _opt;
    }
    
    function runTask(address _sender,uint256 _value,bytes calldata _data) external view returns(uint256){
        require(_whileListAddr[_sender] == true,"no allow address");
        return _value;
    }
}