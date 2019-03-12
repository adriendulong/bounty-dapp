const BountyApp = artifacts.require("./BountyApp.sol");

contract("BountyApp", accounts => {


  /**
   * Test that checks if we are able to create a new bounty
   * In order to chack that the bounty is created we verify the number of bounty created has been increased by one
   */
  it("Should create a bounty", async () => {
    const instance = await BountyApp.deployed();

    // Get the number of bounties created before we create a new one
    const createdOffersCountBefore = await instance.createdBountyCount(accounts[0]);

    // Create a new bounty
    let amountToPay = web3.utils.toWei("1");
    let title = "Test";
    let bountyDescription = "Create a digital map of Bordeaux"
    let result = await instance.createBounty(amountToPay, title, bountyDescription, {from: accounts[0], value: amountToPay});
    
    // Get the number of bounties created
    const createdBountyCount = await instance.createdBountyCount(accounts[0]);

    // Check that the number of bounties created has been incremented by one
    assert.equal(createdBountyCount.toNumber(), (createdOffersCountBefore.toNumber() + 1), "The bounty was not created");
  });


  /**
   * Test that checks that we are able to submit a new work to a bounty
   * To be sure the work has been associated to the right bounty
   * we get the number of works that has been submitted for this bounty and verify it has been incremented by one
   */
  it("Should submit a work to an existing bounty", async () => {
    const instance = await BountyApp.deployed();

    // Create a new bounty
    let amountToPay = web3.utils.toWei("1");
    let title = "Test";
    let jobDescription = "Create a digital map of Bordeaux"
    let result = await instance.createBounty(amountToPay, title, jobDescription, {from: accounts[0], value: amountToPay});

    // Get the id of the newly created bounty
    let newBountyId = result.logs[0].args.bountyId.toNumber();

    // Get the number of work submitted for this bounty before creating one
    const nbWorkBefore = await instance.bountyCountWorks(newBountyId);

    // Submit a work for the bounty we created in the previous step
    await instance.submitWork("A beautiful map", newBountyId, "hahah", {from: accounts[1]});

    // Get the number of work submitted for this bounty
    const nbWork = await instance.bountyCountWorks(newBountyId);

    // Check that the number of works linked to this bounty has been incremented by 1 
    assert.equal(nbWork.toNumber(), (nbWorkBefore.toNumber() + 1), "The work was not created");
  });


  /**
   * Test that checks that we are able to approve a work has a bounty owner
   */
  it("Should approve a work submitted ", async () => {
    const instance = await BountyApp.deployed();

    // Create a new bounty
    let amountToPay = web3.utils.toWei("1");
    let title = "Test";
    let jobDescription = "Create a digital map of Bordeaux"
    let result = await instance.createBounty(amountToPay, title, jobDescription, {from: accounts[0], value: amountToPay});

    // Get the id of the newly created bounty
    let newBountyId = result.logs[0].args.bountyId.toNumber();

    // Submit a work for the bounty
    result = await instance.submitWork("A beautiful map", newBountyId, "hashipfs", {from: accounts[1]});

    // Get the id of the newly created work
    let newWorkId = result.logs[0].args.workId.toNumber();

    // Approve the work submitted
    await instance.approveWork(newBountyId, newWorkId);

    // Check that the job is not opened anymore
    const open = await instance.isBountyOpened(newBountyId)
    assert.equal(open, false, "The work was not approved");
  });


  /**
   * Test that we are able to get all the infos abount a bounty
   */
  it("Should returns all the infos about a bounty ", async () => {
    const instance = await BountyApp.deployed();

    // Create a new bounty
    let amountToPay = web3.utils.toWei("1");
    let title = "Test";
    let jobDescription = "Create a digital map of Bordeaux"
    let result = await instance.createBounty(amountToPay, title, jobDescription, {from: accounts[0], value: amountToPay});

    // Get the id of the newly created bounty
    let newBountyId = result.logs[0].args.bountyId.toNumber();

    // Get the infos of this bounty
    result = await instance.getBountyInfos(newBountyId);

    // Check that all the infos of the bounty match
    assert.equal(result.title, title, "Don't get the right title");
    assert.equal(result.description, jobDescription, "Don't get the right description");
    assert.equal(result.amount.toString(), amountToPay, "Don't get the right amount");
    assert.equal(result.creator, accounts[0], "Don't get the right creator");
    assert.equal(result.isOpened, true, "Don't get the right isOpened value");
    
  });

  /**
   * Test that we are able to get all the ids of the works
   * that has been submitted for a given bounty
   */
  it("Should returns array of work ids that has been submitted", async () => {
    const instance = await BountyApp.deployed();

    // Create a new bounty
    let amountToPay = web3.utils.toWei("1");
    let title = "Test";
    let jobDescription = "Create a digital map of Bordeaux"
    let result = await instance.createBounty(amountToPay, title, jobDescription, {from: accounts[0], value: amountToPay});

    // Get the id of the newly created bounty
    let newBountyId = result.logs[0].args.bountyId.toNumber();

    // Submit a work for the bounty we just created
    result = await instance.submitWork("I did it", newBountyId, "ipfshash");

    // Get the id of the newly created work
    let newWorkId = result.logs[0].args.workId.toNumber();

    // Get the array of work ids that was submitted for the bounty we just created
    let workIds = await instance.getWorkProposedIds(newBountyId);

    // Check that the first work id is equal to the one we just proposed
    assert.equal(workIds[0].toNumber(), newWorkId, "Don't get the work ids");
    // Check that the lenght of the array is only 1
    assert.equal(workIds.length, 1, "Don't get the right number of work ids");
    
  });


  /**
   * Test that checks if we are able to get all the infos of a given work
   */
  it("Should returns the infos of a work", async () => {
    const instance = await BountyApp.deployed();

    // Create a new bounty
    let amountToPay = web3.utils.toWei("1");
    let title = "Test";
    let jobDescription = "Create a digital map of Bordeaux"
    let result = await instance.createBounty(amountToPay, title, jobDescription, {from: accounts[0], value: amountToPay});

    // Get the id of the newly created bounty
    let newBountyId = result.logs[0].args.bountyId.toNumber();

    let description = "I did this job";
    let ipfsHash = "ipfshash";
    // Submit a work for this bounty
    result = await instance.submitWork(description, newBountyId, ipfsHash, {from: accounts[2]});

    // Get the id of the newly created work
    let newWorkId = result.logs[0].args.workId.toNumber();

    // Get the array of work ids that was submitted for the bounty we just created
    let workIds = await instance.getWorkProposedIds(newBountyId);

    // Get the infos of the first work submitted for this bounty (should be the one we created just before)
    let workInfos = await instance.getWorkInfos(workIds[0]);

    // Check that the first work id is equal to the one we jsut proposed + check all the infos of the work
    assert.equal(workIds[0].toNumber(), newWorkId, "Don't get the work ids");
    assert.equal(workInfos.id.toNumber(), newWorkId, "Don't get the right id from infos");
    assert.equal(workInfos.description, description, "Don't get the right description from infos");
    assert.equal(workInfos.isDenied, false, "Don't get the right isDenied from infos");
    assert.equal(workInfos.doer, accounts[2], "Don't get the right creator from infos");
    assert.equal(workInfos.approved, false, "Don't get the right approved from infos");
    assert.equal(workInfos.workFileHash, ipfsHash, "Don't get the right ipfs Hash from infos");
    
  });


  /**
   * Test to reject a work, see if the work is then denied
   */
  it("Should be able to reject a work", async () => {
    const instance = await BountyApp.deployed();

    // Create a new bounty
    let amountToPay = web3.utils.toWei("1");
    let title = "Test";
    let jobDescription = "Create a digital map of Bordeaux"
    let result = await instance.createBounty(amountToPay, title, jobDescription, {from: accounts[0], value: amountToPay});

    // Get the id of the newly created bounty
    let newBountyId = result.logs[0].args.bountyId.toNumber();

    let description = "I did this job"
    // Submit a work
    result = await instance.submitWork(description, newBountyId, "ipfshash", {from: accounts[2]});

    // Get the id of the newly created work
    let newWorkId = result.logs[0].args.workId.toNumber();

    // Reject the work
    result = await instance.rejectWork(newBountyId, newWorkId, {from: accounts[0]});

    // Get the infos of the work
    let work = await instance.getWorkInfos(newWorkId);

    // Check that the work is now denied
    assert.equal(work.isDenied, true, "The work must be as denied since it has been rejected");
    
  });


  /**
   * Test that checks that the owner of the contract is able to activate the circuit breaker
   */
  it("Should be able to activate the circuit breaker", async () => {
    const instance = await BountyApp.deployed();

    // Activate the circuit breaker
    await instance.activateCircuitBreaker({from: accounts[0]});

    // The stop variable must now be true
    let stopped = await instance.stopped({from: accounts[0]});
    assert.equal(stopped, true, "The circuit breaker has not been activated");
    
  });

  // TODO: Test that we can't approve a work that has been rejected
  // TODO: Test that a work approved appear has approved and the bounty as closed
  // TODO: test the the number of works is incremented when a work is submitted
  // TODO: Check that the work id is added to the list of work done by the guy
  // TODO: Test to see if the owner of the contract is able to activate the circuit breaker that will avoid 

});
