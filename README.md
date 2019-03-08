# Bounty dAPP for ConsenSys Academy’s Developer Program Final Project

This is the final project for the [ConsenSys Academy's Developer Program](https://consensys.net/academy/ondemand/).

I decide to implement a Bounty dApp.
In this app the user is able to: 
* Create a bounty
* See the last bounties posted
* See the detail of a bounty, and now its status
* Propose a work for an existing bounty
* If the user is the creator of a bounty he can review the works and accept or reject a work
* Once a work has been accepted the bounty is set as closed and no work can be submitted any more

## Project set up
### Smart Contract
In order to test the project on your local machine you'll have to have [Ganache](https://truffleframework.com/ganache) installed and running on `https://127.0.0.1:7545` and [Truffle](https://truffleframework.com/truffle) too to deploy the smart contracts.

Then to deploy the smart contracts:
1. Go in the project folder
2. Make a `truffle compile`
3. Make a `truffle migrate`
4. To check that everything is ok you can run the tests with `truffle test`


