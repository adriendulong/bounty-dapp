var BountyApp = artifacts.require("./BountyApp.sol");

module.exports = function(deployer) {
  deployer.deploy(BountyApp);
};
