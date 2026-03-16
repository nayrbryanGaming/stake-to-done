// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Custom Errors
error InvalidDeadline();
error InvalidDescription();
error AlreadyCompleted();
error AlreadyClaimed();
error AlreadyProcessed();
error NotYourTask();
error TaskNotFound();
error DeadlinePassed();
error DeadlineNotReached();
error NoStakeFound();
error TransferFailed();
error ZeroAddress();

/**
 * @title StakeToDonePure
 * @dev A decentralized protocol using native ETH for commitment.
 */
contract StakeToDonePure is ReentrancyGuard, Ownable {
    address public treasury;

    struct Task {
        uint256 id;
        address user;
        string description;
        uint256 stakeAmount;
        uint256 deadline;
        bool completed;
        bool claimed; 
    }

    uint256 public taskCounter;
    mapping(uint256 => Task) public tasks;
    mapping(address => uint256[]) public userTasks;

    event TaskCreated(uint256 indexed taskId, address indexed user, string description, uint256 deadline, uint256 amount);
    event TaskCompleted(uint256 indexed taskId, address indexed user);
    event TaskFailed(uint256 indexed taskId, address indexed user, uint256 amount);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    constructor(address _treasury) Ownable(msg.sender) {
        if (_treasury == address(0)) revert ZeroAddress();
        treasury = _treasury;
    }

    /**
     * @dev Create a task and stake native ETH in one go.
     */
    function createAndStakeTask(string memory _description, uint256 _deadline) external payable nonReentrant returns (uint256) {
        if (bytes(_description).length == 0) revert InvalidDescription();
        if (_deadline <= block.timestamp) revert InvalidDeadline();
        if (msg.value == 0) revert NoStakeFound();

        taskCounter++;
        tasks[taskCounter] = Task({
            id: taskCounter,
            user: msg.sender,
            description: _description,
            stakeAmount: msg.value,
            deadline: _deadline,
            completed: false,
            claimed: false
        });

        userTasks[msg.sender].push(taskCounter);
        
        emit TaskCreated(taskCounter, msg.sender, _description, _deadline, msg.value);
        return taskCounter;
    }

    /**
     * @dev Mark task as completed before deadline to get ETH back.
     */
    function completeTask(uint256 _taskId) external nonReentrant {
        Task storage task = tasks[_taskId];
        if (task.user == address(0)) revert TaskNotFound();
        if (task.user != msg.sender) revert NotYourTask();
        if (task.completed) revert AlreadyCompleted();
        if (task.claimed) revert AlreadyClaimed();
        if (block.timestamp >= task.deadline) revert DeadlinePassed();
        if (task.stakeAmount == 0) revert NoStakeFound();

        task.completed = true;
        task.claimed = true;

        (bool success, ) = payable(msg.sender).call{value: task.stakeAmount}("");
        if (!success) revert TransferFailed();

        emit TaskCompleted(_taskId, msg.sender);
    }

    /**
     * @dev Claim expired task stakes to treasury.
     */
    function claimExpiredTask(uint256 _taskId) external nonReentrant {
        Task storage task = tasks[_taskId];
        if (task.user == address(0)) revert TaskNotFound();
        if (task.completed || task.claimed) revert AlreadyProcessed();
        if (block.timestamp < task.deadline) revert DeadlineNotReached();
        if (task.stakeAmount == 0) revert NoStakeFound();

        task.claimed = true;
        (bool success, ) = payable(treasury).call{value: task.stakeAmount}("");
        if (!success) revert TransferFailed();

        emit TaskFailed(_taskId, task.user, task.stakeAmount);
    }

    /**
     * @dev Update treasury address.
     */
    function setTreasury(address _newTreasury) external onlyOwner {
        if (_newTreasury == address(0)) revert ZeroAddress();
        address oldTreasury = treasury;
        treasury = _newTreasury;
        emit TreasuryUpdated(oldTreasury, _newTreasury);
    }

    /**
     * @dev Get all task IDs for a user.
     */
    function getUserTasks(address _user) external view returns (uint256[] memory) {
        return userTasks[_user];
    }

    /**
     * @dev Batch get task details for a list of IDs.
     */
    function getTaskDetails(uint256[] calldata _ids) external view returns (Task[] memory) {
        Task[] memory details = new Task[](_ids.length);
        for (uint256 i = 0; i < _ids.length; i++) {
            details[i] = tasks[_ids[i]];
        }
        return details;
    }

    // Allow receiving ETH
    receive() external payable {}
}
