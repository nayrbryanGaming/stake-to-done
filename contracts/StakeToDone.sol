// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Custom Errors
error Unauthorized();
error InvalidDeadline();
error AlreadyStaked();
error AlreadyCompleted();
error AlreadyClaimed();
error NotYourTask();
error DeadlinePassed();
error DeadlineNotReached();
error NoStakeFound();
error TransferFailed();
error ZeroAddress();

/**
 * @title StakeToDone
 * @dev A commitment protocol where users stake tokens to finish tasks.
 */
contract StakeToDone is ReentrancyGuard, Ownable {
    IERC20 public immutable stakingToken;
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

    event TaskCreated(uint256 indexed taskId, address indexed user, string description, uint256 deadline);
    event TaskStaked(uint256 indexed taskId, address indexed user, uint256 amount);
    event TaskCompleted(uint256 indexed taskId, address indexed user);
    event TaskFailed(uint256 indexed taskId, address indexed user, uint256 amount);

    constructor(address _stakingToken, address _treasury) Ownable(msg.sender) {
        if (_stakingToken == address(0) || _treasury == address(0)) revert ZeroAddress();
        stakingToken = IERC20(_stakingToken);
        treasury = _treasury;
    }

    /**
     * @dev Create a new task with a description and deadline.
     */
    function createTask(string memory _description, uint256 _deadline) external returns (uint256) {
        if (_deadline <= block.timestamp) revert InvalidDeadline();

        taskCounter++;
        tasks[taskCounter] = Task({
            id: taskCounter,
            user: msg.sender,
            description: _description,
            stakeAmount: 0,
            deadline: _deadline,
            completed: false,
            claimed: false
        });

        userTasks[msg.sender].push(taskCounter);
        emit TaskCreated(taskCounter, msg.sender, _description, _deadline);
        return taskCounter;
    }

    /**
     * @dev Stake tokens for a specific task.
     */
    function stakeTask(uint256 _taskId, uint256 _amount) external nonReentrant {
        Task storage task = tasks[_taskId];
        if (task.user != msg.sender) revert NotYourTask();
        if (task.stakeAmount > 0) revert AlreadyStaked();
        if (task.deadline <= block.timestamp) revert DeadlinePassed();
        if (_amount == 0) revert NoStakeFound();

        task.stakeAmount = _amount;
        if (!stakingToken.transferFrom(msg.sender, address(this), _amount)) revert TransferFailed();

        emit TaskStaked(_taskId, msg.sender, _amount);
    }

    /**
     * @dev Mark task as completed before deadline to get stake back.
     */
    function completeTask(uint256 _taskId) external nonReentrant {
        Task storage task = tasks[_taskId];
        if (task.user != msg.sender) revert NotYourTask();
        if (task.completed) revert AlreadyCompleted();
        if (task.claimed) revert AlreadyClaimed();
        if (block.timestamp > task.deadline) revert DeadlinePassed();
        if (task.stakeAmount == 0) revert NoStakeFound();

        task.completed = true;
        task.claimed = true;

        if (!stakingToken.transfer(msg.sender, task.stakeAmount)) revert TransferFailed();

        emit TaskCompleted(_taskId, msg.sender);
    }

    /**
     * @dev Claim expired task stakes to treasury. Can be called by anyone 
     *      to prune the system, but funds always go to treasury.
     */
    function claimExpiredTask(uint256 _taskId) external nonReentrant {
        Task storage task = tasks[_taskId];
        if (task.completed) revert AlreadyCompleted();
        if (task.claimed) revert AlreadyClaimed();
        if (block.timestamp <= task.deadline) revert DeadlineNotReached();
        if (task.stakeAmount == 0) revert NoStakeFound();

        task.claimed = true;
        if (!stakingToken.transfer(treasury, task.stakeAmount)) revert TransferFailed();

        emit TaskFailed(_taskId, task.user, task.stakeAmount);
    }

    /**
     * @dev Update treasury address.
     */
    function setTreasury(address _newTreasury) external onlyOwner {
        if (_newTreasury == address(0)) revert ZeroAddress();
        treasury = _newTreasury;
    }

    /**
     * @dev Get all task IDs for a user.
     */
    function getUserTasks(address _user) external view returns (uint256[] memory) {
        return userTasks[_user];
    }
}

