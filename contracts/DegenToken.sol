// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DegenToken is ERC20, Ownable {
    constructor() ERC20("Degen", "DGN") {}

    uint256 id;

    struct GameItem {
        uint256 id;
        string name;
        uint256 amount;
    }

    mapping(uint256 => GameItem) gameItemToAmount;
    mapping(address => mapping(uint256 => uint256)) playerToGameItems;

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function sendTokenToPlayer(address to, uint256 amount) external {
        transfer(to, amount);
    }

    function checkBalance(address to) external view returns (uint256) {
        return balanceOf(to);
    }

    function createInGameItem(string memory name, uint256 amount) external onlyOwner {
        gameItemToAmount[id] = GameItem(id, name, amount);
        id++;
    }

    function redeem(uint256 itemId) external {
        uint256 amount = gameItemToAmount[itemId].amount;

        playerToGameItems[msg.sender][itemId] = playerToGameItems[msg.sender][itemId] + 1;
        transfer(address(this), amount);
    }

    function gameItemBalance(uint256 itemId) external view returns (uint256) {
        return playerToGameItems[msg.sender][itemId];
    }
}
