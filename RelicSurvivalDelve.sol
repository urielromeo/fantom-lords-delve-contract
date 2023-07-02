// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
           .--._.--.
          ( O     O )
          /   . .   \
         .`._______.'.
        /(           )\
      _/  \  \   /  /  \_
   .~   `  \  \ /  /  '   ~.
  {    -.   \  V  /   .-    }
_ _`.    \  |  |  |  /    .'_ _
>_       _} |  |  | {_       _<
 /. - ~ ,_-'  .^.  `-_, ~ - .\
         '-'|/   \|`-`

 *        /| ________________
 *  O|===|* >________________ >   https://fantomlords.com
 *        \|
 *
 * @title Arcane Relic Dungeon Delve: Brave the depths of the dungeon together with Sir Hopper the knight, gathering Arcane Relics and many more treasures!
 * @dev A contract that allows knights to delve into treasures and receive tokens in return.     
 *      Only the noble contract owner can set token addresses and modify percentages.
 */
 
contract RelicSurvivalDelve is Ownable {
    // State variables
    address[] public tokenAddresses; // List of token addresses
    uint[] public tokenPercentages; // List of token distribution percentages
    uint public gamePrice = 100000000000000000; // Price to delve into the treasures

    receive() external payable {}

    /**
     * @dev Sets a new token address and its corresponding distribution percentage.
     *      Only the noble contract owner can call this function.
     * @param tokenAddress The address of the token contract
     * @param percentage The percentage of tokens to be distributed for this token address
     */
    function setTokenAddress(address tokenAddress, uint percentage) public onlyOwner {
        require(tokenAddress != address(0), "Invalid token address");
        require(percentage <= 1000000, "Invalid percentage");
        
        tokenAddresses.push(tokenAddress);
        tokenPercentages.push(percentage);
    }

    /**
     * @dev Retrieves the list of token addresses.
     * @return An array containing the token addresses.
     */
    function getTokenAddresses() public view returns (address[] memory) {
        return tokenAddresses;
    }

    /**
     * @dev Retrieves the list of token distribution percentages.
     * @return An array containing the token distribution percentages.
     */
    function getTokenPercentages() public view returns (uint[] memory) {
        return tokenPercentages;
    }

    /**
     * @dev Modifies the distribution percentage for a specific token address.
     *      Only the noble contract owner can call this function.
     * @param index The index of the token address in the list
     * @param newPercentage The new distribution percentage for the token address
     */
    function modifyPercentage(uint index, uint newPercentage) public onlyOwner {
        require(index < tokenPercentages.length, "Invalid index");
        require(newPercentage <= 1000000, "Invalid percentage");
        tokenPercentages[index] = newPercentage;
    }
    

    /**
     * @dev Sets the price to delve into the treasures.
     *      Only the noble contract owner can call this function.
     * @param price The new price to delve into the treasures
     */
    function setGamePrice(uint price) public onlyOwner {
        gamePrice = price;
    }
    
    /**
     * @dev Retrieves the current price to delve into the treasures.
     * @return The current price to delve into the treasures.
     */
    function getGamePrice() public view returns (uint) {
        return gamePrice;
    }


    /**
     * @dev Allows the noble contract owner to withdraw the contract's balance in Ether.
     *      Only the noble contract owner can call this function.
     */
    function withdraw() public onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "Contract balance is zero");
        
        address payable ownerAddress = payable(owner());
        ownerAddress.transfer(balance);
    }

    /**
     * @dev Allows the noble contract owner to withdraw a specific token from the contract.
     *      Only the noble contract owner can call this function.
     * @param index The index of the token address in the list
     */
    function withdrawToken(uint index) public onlyOwner {
        require(index < tokenAddresses.length, "Invalid index");
        uint tokenBalance = IERC20(tokenAddresses[index]).balanceOf(address(this));
        require(tokenBalance > 0, "Contract token balance is zero");
        IERC20(tokenAddresses[index]).transfer(owner(), tokenBalance);
    }
    

    /**
     * @dev Allows a brave knight to delve into the treasures by sending the exact game price.
     *      The function distributes the set percentage of tokens to the sender.
     */
    function delve() public payable {
        require(msg.value == gamePrice, "Incorrect payment amount");
        
        for (uint i = 0; i < tokenAddresses.length; i++) {
            address tokenAddress = tokenAddresses[i];
            uint tokenPercentage = tokenPercentages[i];
            uint tokenBalance = IERC20(tokenAddress).balanceOf(address(this));
            uint tokenAmount = (tokenBalance * tokenPercentage) / 1000000;
            IERC20(tokenAddress).transfer(msg.sender, tokenAmount);
        }
    }
}