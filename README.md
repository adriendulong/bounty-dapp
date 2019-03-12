# Bounty dAPP for ConsenSys Academy’s Developer Program Final Project

This is the final project for the [ConsenSys Academy's Developer Program](https://consensys.net/academy/ondemand/).

I decided to implement a Bounty dApp.
In this app the user is able to: 
* Create a bounty
* See the last bounties posted
* See the detail of a bounty, and know its status
* Propose a work for an existing bounty
* If the user is the creator of a bounty he can review the works and accept or reject a work
* Once a work has been accepted the bounty is set as closed and no work can be submitted anymore
* Access to his profile to see its balance and withdraw it
* Access to his profile to consult the list of bounties or works he posted

## Local project set up
### Smart Contract
In order to test the project on your local machine, you'll have to have [Ganache](https://truffleframework.com/ganache) installed and running on `https://127.0.0.1:7545` and [Truffle](https://truffleframework.com/truffle) too to deploy the smart contracts.

Then to deploy the smart contracts:
1. Go in the project folder
2. Make a `truffle compile`
3. Make a `truffle migrate`
4. To check that everything is ok you can run the tests with `truffle test`

### UI Server
This is how to launch the local server:
1. Go to the project folder
2. Go in the client directory `cd client`
3. The first time make an `npm install` or `yarn install`
4. Then to launch the server, make an `npm run start`
5. Go in your browser and go to `localhost:3000`

In order to work, you must have Metamask installed in your browser, and have it connected to your Ganache local Ethereum blockchain.

## Testnet deployment infos
The smart contract has been deployed on the Rinkeby test network.
All the infos about the contract address and the transaction hash of the deployment can be found in the file `deployed_addresses.txt`.
I had some issue verifying the code on Ethers
x
## Remote server
The dapp is available at this url: https://bounty-dapp-dylkx1cy2.now.sh
Please use Metamask and the Rinkeby test network in order to access the app.

## Libraries or EthPM packages used
### SafeMath (from OpenZeppeling)
I used the SaeMath library from OpenZeppelin in order to avoid integers overflow or underflow.
This can happen when an integer overflows the limit that is set for this number. For example for an unsigned integer which limit is 2 ^ 256 - 1, if an integer overflow, the value will go back to 0.


### Counter (from OpenZeppelin)
The Counter library from OpenZeppelin provides an incrementing uint256 id that is useful 
for issuing ids for ERC-721 tokens.
In this project, it is used to issue a new id for each new bounty or work.


## IPFS for dynamically upload files

I used the IPFS in order to allow users to associate a file to a work that they submit.
The file is uploaded to IPFS, the hash is saved. Later anyone can access the file through the IPFS gateway (a direct link is provided on each work).
*WARNING*: In order for the IPFS file to be available through the gateway you may have to keep the dapp a bit open in order for the local daemon to transfer the file to other nodes.




