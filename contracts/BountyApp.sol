pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/drafts/Counter.sol";

contract BountyApp {
    using SafeMath for uint256;
    using Counter for Counter.Counter;
    
    address public owner;

    bool public stopped = false;
    
    /**
     * @dev Bounty struct
     * Holds all the infos about a job offer
     */
    struct Bounty {
        // If the offer is still opened
        bool isOpened;
        // If the offer exist
        bool exist;
        // The amount that will be payed for this offer
        uint256 amount;
        // Title of the offer
        string title;
        // The description of the offer
        string description;
        
    }
    
    // Id of the bounties that increment by one for each new bounty
    Counter.Counter private bountyId;
    // Mapping between the bounty id and the bounty struct
    mapping(uint256 => Bounty) public idToBounty;
    // Mapping between a bountyId and its creator
    mapping(uint256 => address) public bountyIdToCreator;
    // Mapping from creator to number of bounty created
    mapping(address => uint256) public createdBountyCount;
    // Mapping between a creator and the list of bountyId he created
    mapping(address => uint256[]) public creatorToBountyIds;
    
    
    /**
     * @dev Work struct
     * It holds all the infos about a work that is submitted to 
     * fullfill a bounty
     */
    struct Work {
        string workFileHash;
        string description;
        // if the bounty creator refused it
        bool denied;
        bool exist;
        // If the bounty creator approved this work
        bool approved;
        address doer;
    }

    // Id of the works that increment by one for each new work
    Counter.Counter private workId;
    // Mapping between a work id and the work struct
    mapping(uint256 => Work) public idToWork;
    // mapping between a bounty id and the ids of the works that have been submitted
    mapping(uint256 => uint256[]) public bountyIdToWorkIds;
    // Mapping between work and its doer
    mapping(uint256 => address) public workIdToDoer;
    // Mapping between a work and the bounty it aims
    mapping(uint256 => uint256) public workIdToBountyId;
    // Map between an address and the count of works proposed by this address
    mapping(address => uint256) public worksProposedCount;
    // Mapping between an address and the work ids that it has proposed
    mapping(address => uint256[]) public doerToWorkIds;
    
    
    // withdrawal pending for job posters 
    mapping(address => uint256) public pendingWithdrawals;


    /// EVENTS
    event NewBounty(uint256 bountyId, address creator);
    event NewWork(uint256 workId, uint256 bountyId, address hunter);
    event WorkApproved(uint256 workId, uint256 bountyId);
    event WorkRejected(uint256 workId, uint256 bountyId);
    
    /**
     * @dev Constructor that set the owner of the contract
     */
    constructor() public {
        owner = msg.sender;
    }
    
    /**
     * @dev Modifier that avoid a function to run when we are 
     * in an emergency situation (Circuit Breaker design pattern)
     */
    modifier stopInEmergency { require(!stopped); _; }

    /**
     * @dev Modifier that make sure this function can run only when 
     * the smart contract is in emergency mode (Circuit Breaker design pattern)
     */
    modifier onlyInEmergency { require(stopped); _; }


    /**
     * @dev Modifier that checks if the function caller is also the smart contract owner
     */
    modifier onlyOwner { require(msg.sender == owner); _; }


    /**
     * @dev Modifier that check if a bounty exists
     * @param id uint256 Bounty id
     */
    modifier bountyExist(uint256 id) {
        require(idToBounty[id].exist != false, "This bounty does not exist");
        _;
    }


    /**
     * @dev Modifier that check if a work exists
     * @param id uint256 Work id
     */
    modifier workExist(uint256 id) {
        require(idToWork[id].exist != false, "This work does not exist");
        _;
    }


    /**
     * @dev Modifier that checks that an bounty is still open
     * @param id uint256 Bounty id
     */
    modifier bountyOpen(uint256 id) {
        require(idToBounty[id].isOpened == true, "Bounty not opened for work");
        _;
    }


    /**
     * @dev Activate the emergency mode (Circuit Breaker design patter)
     * Only the owner of the smart contract can do it
     */
    function activateCircuitBreaker() onlyOwner public {
        stopped = true;
    }
    

    /**
     * @dev Returns the number of work that has been submitted for this bounty
     * @param id uint256 Id of the job 
     * @return uint256
     */
    function bountyCountWorks(uint256 id) public view bountyExist(id) returns (uint256) {
        return bountyIdToWorkIds[id].length;
    }


    /**
     * @dev Returns true if the bounty has not been filled yet
     * @param _bountyId uint256 Id of the bounty
     * @return bool
     */
    function isBountyOpened(uint256 _bountyId) public view bountyExist(_bountyId) returns (bool) {
        return idToBounty[_bountyId].isOpened;
    }


    /**
     * @dev Create a new bounty as a creator the caller
     * The user must provide at least the amount that he is willing to pay for this bounty
     * @param amount uint256 Amount to be paid when the bounty is done
     * @param title string Title of the bounty to create
     * @param description string Description of the bounty 
     * @return bountyId uint256
     */
    function createBounty(uint256 amount, string memory title, string memory description) stopInEmergency public payable returns (uint256) {
        // Check that the user pays at leat the amount he is willing to pay for the bounty
        require(msg.value >= amount, "Ether sent must be at least equal to the amount you're willing to pay for the bounty");
        // Create a new bounty
        Bounty memory newBounty = Bounty(true, true, amount, title, description);
        // Increment the bountyId
        uint256 newBountyId = bountyId.next();
        // Associate the bounty id to the creator address
        bountyIdToCreator[newBountyId] = msg.sender;
        // Increment the number of bounty created by this user
        createdBountyCount[msg.sender]++;
        // Add the bounty id to the list of bounty ids this user has created
        creatorToBountyIds[msg.sender].push(newBountyId);
        // Add the bounty struct to the mapping of bountyId to job
        idToBounty[newBountyId] = newBounty;
        
        // Add to the user balance the extra he would have paid
        // Here we implement the withdraw design pattern to avoid someone to block the contract
        if(msg.value > amount) {
            uint256 change = msg.value.sub(amount);
            pendingWithdrawals[msg.sender] += change;
        }
        
        // Emit NewBounty event
        emit NewBounty(newBountyId, msg.sender);

        // Return the bounty id of the bounty we just created
        return newBountyId;
    }


    /**
     * @dev Get all the infos abount a bounty
     * @param bountyId uint256 id of the bounty 
     * @return title string Title of the bounty
     * @return description string Description of the bounty
     * @return amount uint256 The amount that will be paid for this bounty
     * @return id uint256 Bounty id
     * @return creator Address of the bounty creator
     * @return isOpened bool If the bounty is still opened for work submission
     */
    function getBountyInfos(uint256 bountyId) public view bountyExist(bountyId) returns (
        string memory title,
        string memory description,
        uint256 amount,
        uint256 id,
        address creator,
        bool isOpened
    )
    {
        Bounty memory bounty = idToBounty[bountyId];
        return (bounty.title, bounty.description, bounty.amount, bountyId, bountyIdToCreator[bountyId], bounty.isOpened);
    }

    /**
     * @dev Returns the last bounty id that was created
     * @return bountyId uint256 The last bounty id 
     */
    function getLastBountyId() public view returns (uint256) {
        return bountyId.current;
    }
    
    
    /**
     * @dev Submit the work that has been done for approval
     * @param description string Description of the work
     * @param id uint256 Id of the bounty the work has been done for
     * @notice Use IFPS to submit the work
     * @return newWorkId uint256 The id of the new work
     */
    function submitWork(string memory description, uint256 id, string memory workFileHash) public stopInEmergency bountyExist(id) bountyOpen(id) returns (uint256 newWorkId){
        // Create the new work
        Work memory work = Work(workFileHash, description, false, true, false, msg.sender);
        // Increment the workId
        newWorkId = workId.next();
        // Add the work to the list of work that has been submitted for this bounty
        bountyIdToWorkIds[id].push(newWorkId);
        // Associate the work to its doer
        doerToWorkIds[msg.sender].push(newWorkId);
        // Associate the work with the job id it aims to fill
        workIdToBountyId[newWorkId] = id;
        // Map the work id to the work struct
        idToWork[newWorkId] = work;
        // Increment the number of works submitted
        worksProposedCount[msg.sender]++;

        // Emit NewWork event
        emit NewWork(newWorkId, id, msg.sender);
    }
    
    
    /**
     * @dev Bounty owner call it to approve a work submitted for this work
     * @param _bountyId uint256 Id of the bounty the work is linked to
     * @param _workId uint256 Id of the work that will be approved
     */
    function approveWork(uint256 _bountyId, uint256 _workId) public stopInEmergency bountyExist(_bountyId) workExist(_workId) bountyOpen(_bountyId){
        // Check the message sender is also the creator of the bounty
        require(bountyIdToCreator[_bountyId] == msg.sender, "Must be the bounty creator");
        // Check this work was for this bounty
        require(workIdToBountyId[_workId] == _bountyId, "This work does not fill this bounty");
        // Check that the work has not been rejected
        require(!idToWork[_workId].denied, "This work has already been rejected");
        
        // Set the bounty to close
        idToBounty[_bountyId].isOpened = false;
        // Set the work as approved
        idToWork[_workId].approved = true;
        address hunter = idToWork[_workId].doer;
        // Add the amount of the bounty to the hunter balance (for later withdraw)
        pendingWithdrawals[hunter] += idToBounty[_bountyId].amount;
        
        // Emit event WorkApproved
        emit WorkApproved(_workId, _bountyId);
    }

    /**
     * @dev Bounty owner call it to reject a work submitted for this work
     * @param _bountyId uint256 Id of the bounty the work is linked to
     * @param _workId uint256 Id of the work that will be rejected
     */
    function rejectWork(uint256 _bountyId, uint256 _workId) public stopInEmergency bountyExist(_bountyId) workExist(_workId) bountyOpen(_bountyId){
        // Check the message sender is also the creator of the work
        require(bountyIdToCreator[_bountyId] == msg.sender, "Must be the bounty creator");
        // Check this work was for this bounty
        require(workIdToBountyId[_workId] == _bountyId, "This work does not fill this bounty");
        
        // Set the work as approved
        idToWork[_workId].denied = true;
        
        // Emit event WorkApproved
        emit WorkRejected(_workId, _bountyId);
    }


    /**
     * @dev Returns an array of uint256 that the ids of the work that have been submitted for this bounty
     * @param _bountyId uint256
     */
    function getWorkProposedIds(uint256 _bountyId) public view returns (uint256[] memory) {
        return bountyIdToWorkIds[_bountyId];
    }


    /**
     * @dev Return the infos of a work
     * @param _workId uint256 Id of the work
     * @return id uint256 Id of the work
     * @return description string Description of the work
     * @return isDenied bool If the work has been rejected or not
     * @return doer address od the work doer
     * @return approved book If the work has been approved
     */
    function getWorkInfos(uint256 _workId) public view returns (
        uint256 id,
        string memory description,
        string memory workFileHash,
        bool isDenied,
        address doer,
        bool approved
    )
    {
        Work memory work = idToWork[_workId];
        return (_workId, work.description, work.workFileHash, work.denied, work.doer, work.approved);
    }
    
    
    /**
     * @dev Allow to withdraw a pending balance of a user
     */
    function withdrawPending()  stopInEmergency public {
        require(pendingWithdrawals[msg.sender] > 0, "You balance is nul, you can't withdraw anything");
        uint256 amount = pendingWithdrawals[msg.sender];
        pendingWithdrawals[msg.sender] = 0;
        msg.sender.transfer(amount);
    }
}