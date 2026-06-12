// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract DailyGrindVault is Ownable {
    IERC20 public usdcToken;
    address public oracleSigner;
    address public charityAddress;
    
    // Mapping of user address -> deposited amount
    mapping(address => uint256) public deposits;

    event Deposited(address indexed user, uint256 amount);
    event Resolved(address indexed user, uint256 amount, bool success);
    
    constructor(address _usdcToken, address _oracleSigner, address _charityAddress) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
        oracleSigner = _oracleSigner;
        charityAddress = _charityAddress;
    }

    // Set the oracle that can resolve grinds
    function setOracle(address _oracleSigner) external onlyOwner {
        oracleSigner = _oracleSigner;
    }

    // Deposit USDC into the vault
    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        deposits[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    // Oracle resolves the grind
    function resolveGrind(address user, uint256 amount, bool success) external {
        require(msg.sender == oracleSigner, "Only Oracle can resolve");
        require(deposits[user] >= amount, "Insufficient deposit");

        deposits[user] -= amount;

        if (success) {
            // User completed grind, return their USDC
            require(usdcToken.transfer(user, amount), "Transfer failed");
        } else {
            // User failed, slash funds to charity
            require(usdcToken.transfer(charityAddress, amount), "Transfer failed");
        }

        emit Resolved(user, amount, success);
    }
}
