// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OnePieceCoin is ERC20, ERC20Burnable, Ownable {
    constructor() ERC20("OnePiece Coin", "OPC") Ownable(msg.sender) {
        // Mencetak 5 koin saat kontrak di-deploy, seperti yang diminta.
        _mint(msg.sender, 5 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
