# Avoiding Common Attacks

## Avoid integers overflow
One of the possible attacks is to try to make an integer overflow in order to have the integer get back to 0.
In order to avoir this attack I use the _SafeMath_ library from OpenZeppelin. It prevents integers to overflow or underflow.

## Avoid re-entrancy for transfering fund
An other possible attack is for a contract to try to re enter in the same function again and again. 
This attack is done thanks to a smart contract that will call again the same function and try to benefit from it if we don't protect it.
A way to prevent this is to do all the important works in the function (like set a balance to 0) before calling the external contract.
For this project I avoid to be exposed to this attack setting the `pendingWithdrawals` of this account to 0 before transferring the funds:
```javascript
require(pendingWithdrawals[msg.sender] > 0, "You balance is nul, you can't withdraw anything");
uint256 amount = pendingWithdrawals[msg.sender];
pendingWithdrawals[msg.sender] = 0;
msg.sender.transfer(amount);
```

## Avoid denial of service for transfering fund
A denial of service is when an external contract always revert when we try to call one of his function. It can be a problem when it results in blocking
the state of our contract.
In order to avoid that the `pull over push payment` design pattern is a solution when we need to transfer funds to an address. 
That is why I implemented this design pattern.