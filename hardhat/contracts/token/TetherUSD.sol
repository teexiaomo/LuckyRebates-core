// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TetherUSD is ERC20, Ownable {
    constructor(address initialOwner)
        ERC20("Tether USD", "USDT")
        Ownable()
    {
        _transferOwnership(initialOwner);
        _mint(msg.sender, 10000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function decimals() public view override virtual returns (uint8) {
        return 6;
    }
}