// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StartupFunding {
    address public owner;
    uint256 public totalFunds;
    uint256 public totalDonated;

    // Events to track funding and withdrawal activities
    event Funded(address indexed funder, uint256 amount);
    event Withdrawn(address indexed owner, uint256 amount);

    constructor() {
        owner = msg.sender;
        totalFunds = 0;
        totalDonated = 0;
    }

    // Function to allow anyone to fund the contract
    function fund() external payable {
        require(msg.value > 0, "Must send ETH to fund the contract.");
        totalFunds += msg.value;
        totalDonated += msg.value;
        emit Funded(msg.sender, msg.value);
    }

    // Function to allow the owner to withdraw the funds
    function withdrawFunds() external onlyOwner {
        require(totalFunds > 0, "No funds available for withdrawal.");
        uint256 amountToWithdraw = totalFunds;
        totalFunds = 0;
        (bool success, ) = payable(owner).call{value: amountToWithdraw}("");
        require(success, "Withdrawal failed.");
        emit Withdrawn(owner, amountToWithdraw);
    }

    // Modifier to ensure that only the owner can call certain functions
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }
}
