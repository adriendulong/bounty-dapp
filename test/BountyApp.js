const BountyApp = artifacts.require("./BountyApp.sol");

contract("BountyApp", accounts => {


  it("Should create a job offer", async () => {
    const instance = await BountyApp.deployed();

    // Get the number of offer created for this account before create one
    const createdOffersCountBefore = await instance.createdBountyCount(accounts[0]);

    // Create a new offer
    let amountToPay = web3.utils.toWei("1");
    let title = "Test";
    let jobDescription = "Create a digital map of Bordeaux"
    let result = await instance.createBounty(amountToPay, title, jobDescription, {from: accounts[0], value: amountToPay});
    
    // Get the new number of offer created has been increased by one
    const createdBountyCount = await instance.createdBountyCount(accounts[0]);

    // Check that the number of offer created 
    assert.equal(createdBountyCount.toNumber(), (createdOffersCountBefore.toNumber() + 1), "The job offer was not created");
  });


  it("Should submit a work to an existing offer", async () => {
    const instance = await BountyApp.deployed();

    // Create a new offer
    let amountToPay = web3.utils.toWei("1");
    let title = "Test";
    let jobDescription = "Create a digital map of Bordeaux"
    let result = await instance.createBounty(amountToPay, title, jobDescription, {from: accounts[0], value: amountToPay});

    // Get the id of the newly created offer
    let newBountyId = result.logs[0].args.bountyId.toNumber();

    // Get the number of work submitted for this bounty before creating one
    const nbWorkBefore = await instance.bountyCountWorks(newBountyId);

    // Submit a work for the job offer with id 1
    await instance.submitWork("A beautiful map", newBountyId, {from: accounts[1]});

    // Get the number of work submitted for this offer
    const nbWork = await instance.bountyCountWorks(newBountyId);

    // Check that the number of offer created 
    assert.equal(nbWork.toNumber(), (nbWorkBefore.toNumber() + 1), "The work was not created");
  });



  it("Should approve a work submitted ", async () => {
    const instance = await BountyApp.deployed();

    // Create a new offer
    let amountToPay = web3.utils.toWei("1");
    let title = "Test";
    let jobDescription = "Create a digital map of Bordeaux"
    let result = await instance.createBounty(amountToPay, title, jobDescription, {from: accounts[0], value: amountToPay});

    // Get the id of the newly created offer
    let newBountyId = result.logs[0].args.bountyId.toNumber();

    // Submit a work for the job offer with id 1
    result = await instance.submitWork("A beautiful map", newBountyId, {from: accounts[1]});

    // Get the id of the newly created offer
    let newWorkId = result.logs[0].args.workId.toNumber();

    // Approve the work submitted
    await instance.approveWork(newBountyId, newWorkId);

    const open = await instance.isBountyOpened(newBountyId)

    // Check that the job is not opened anymore
    assert.equal(open, false, "The work was not approved");
  });


  it("Should returns all the infos about a bounty ", async () => {
    const instance = await BountyApp.deployed();

    // Create a new offer
    let amountToPay = web3.utils.toWei("1");
    let title = "Test";
    let jobDescription = "Create a digital map of Bordeaux"
    let result = await instance.createBounty(amountToPay, title, jobDescription, {from: accounts[0], value: amountToPay});

    // Get the id of the newly created offer
    let newBountyId = result.logs[0].args.bountyId.toNumber();

    // Submit a work for the job offer with id 1
    result = await instance.getBountyInfos(newBountyId);

    // Check that the job is not opened anymore
    assert.equal(result.title, title, "Don't get the right title");
    assert.equal(result.description, jobDescription, "Don't get the right description");
    assert.equal(result.amount.toString(), amountToPay, "Don't get the right amount");
    assert.equal(result.creator, accounts[0], "Don't get the right creator");
    assert.equal(result.isOpened, true, "Don't get the right isOpened value");
    
  });

  it("Should returns array of work ids that has been submitted", async () => {
    const instance = await BountyApp.deployed();

    // Create a new offer
    let amountToPay = web3.utils.toWei("1");
    let title = "Test";
    let jobDescription = "Create a digital map of Bordeaux"
    let result = await instance.createBounty(amountToPay, title, jobDescription, {from: accounts[0], value: amountToPay});

    // Get the id of the newly created offer
    let newBountyId = result.logs[0].args.bountyId.toNumber();

    // Submit a work for the job offer with id 1
    result = await instance.submitWork("I did it", newBountyId);

    // Get the id of the newly created work
    let newWorkId = result.logs[0].args.workId.toNumber();

    // Get the array of work ids that was submitted for the bounty we just created
    let workIds = await instance.getWorkProposedIds(newBountyId);


    // Check that the first work id is equal to the one we jsut proposed
    assert.equal(workIds[0].toNumber(), newWorkId, "Don't get the work ids");
    
  });

  it("Should returns the infos of a work", async () => {
    const instance = await BountyApp.deployed();

    // Create a new offer
    let amountToPay = web3.utils.toWei("1");
    let title = "Test";
    let jobDescription = "Create a digital map of Bordeaux"
    let result = await instance.createBounty(amountToPay, title, jobDescription, {from: accounts[0], value: amountToPay});

    // Get the id of the newly created offer
    let newBountyId = result.logs[0].args.bountyId.toNumber();

    let description = "I did this job"
    // Submit a work for the job offer with id 1
    result = await instance.submitWork(description, newBountyId, {from: accounts[2]});

    // Get the id of the newly created work
    let newWorkId = result.logs[0].args.workId.toNumber();

    // Get the array of work ids that was submitted for the bounty we just created
    let workIds = await instance.getWorkProposedIds(newBountyId);

    let workInfos = await instance.getWorkInfos(workIds[0]);

    // Check that the first work id is equal to the one we jsut proposed
    assert.equal(workIds[0].toNumber(), newWorkId, "Don't get the work ids");
    assert.equal(workInfos.id.toNumber(), newWorkId, "Don't get the right id from infos");
    assert.equal(workInfos.description, description, "Don't get the right description from infos");
    assert.equal(workInfos.isDenied, false, "Don't get the right isDenied from infos");
    assert.equal(workInfos.doer, accounts[2], "Don't get the right creator from infos");
    assert.equal(workInfos.approved, false, "Don't get the right approved from infos");
    
  });

  //Test that a work approved appear has approved and the bounty as closed

  // Test to reject a work, see if the work is then denied
  it("Should be able to reject a work", async () => {
    const instance = await BountyApp.deployed();

    // Create a new offer
    let amountToPay = web3.utils.toWei("1");
    let title = "Test";
    let jobDescription = "Create a digital map of Bordeaux"
    let result = await instance.createBounty(amountToPay, title, jobDescription, {from: accounts[0], value: amountToPay});

    // Get the id of the newly created offer
    let newBountyId = result.logs[0].args.bountyId.toNumber();

    let description = "I did this job"
    // Submit a work for the job offer with id 1
    result = await instance.submitWork(description, newBountyId, {from: accounts[2]});

    // Get the id of the newly created work
    let newWorkId = result.logs[0].args.workId.toNumber();

    result = await instance.rejectWork(newBountyId, newWorkId, {from: accounts[0]});

    let work = await instance.getWorkInfos(newWorkId);

    assert.equal(work.isDenied, true, "The work must be as denied since it has been rejected");
    
  });

  // Test that we can't approve a work that has been rejected

  //TODO: test the the number of works is incremented when a work is submitted
  // TODO: Check that the work id is added to the list of work done by the guy

});
