# Design Pattern Decisions

In this project, I decided to implement some design patterns that were introduced in Module 10 of the ConsenSys Developer Academy.

## Circuit Breaker
I decided to implement the *Circuit Breaker* pattern in order to allow the creator of the app to freeze the app in case of a bug or an emergency. 
If the smart contract creator activates the emergency mode, it will allow users to:
* Create a new bounty
* Propose a new work
* Accept or reject a work

But users will still be able to withdraw their funds.

The *downside* of this pattern is that it centralizes a bit the app where our goal with dapp is to avoid centralization. So it must be used with caution and only with the idea to protect users. 

## Fail early and fail loud

In each function, I used the `require()` function in order to check some conditions.
It allows returning an error if these conditions are not met. 
It matches with the idea to *fail early and loudly* in order to avoid to not have a clear idea if the function executed properly or failed.
In order to do that properly, I also use some *modifiers* that allows reusing these conditions in multiple places.

Modifiers created: `bountyExist(uint256 id)`, `workExist(uint256 id)`, `bountyOpen(uint256 id)`.

## Pull over push payments

The idea with the pull over design pattern also called the _withdrawal pattern_, is to protect the Smart Contract from re-entrancy and denial of service attacks. 
In place of sending directly funds to an address, we let the address withdraws the funds itself calling a function when he wants to withdraw them.
This pattern is well explained on the [Solidity docs](https://solidity.readthedocs.io/en/v0.5.1/common-patterns.html#withdrawal-from-contracts).

In this smart contract, when someone has his work approved for a bounty, the amount of this bounty is transfered to the balance of the user who submitted the work. Then from his profile, he/she can withdraw it whenever he wants. The wrong solution would have been to transfer directly the funds to the address when the work is approved.