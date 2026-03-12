# STAKE-TO-DONE PROTOCOL - PLATINUM MVP v5.1.0-ELITE
**Zero Trash • Zero Cacat • 101% Elite Handover**

This document provides a complete, step-by-step implementation guide for the STAKE-TO-DONE Protocol on Base Sepolia.

---

### 1. System Architecture
The protocol is a decentralized "Commitment Escrow" system. It uses financial loss aversion to enforce human discipline.

```
+------------+       USDC Approval       +-------------------+
|   USER     | ------------------------> |   MockUSDC Token  |
+------------+                           +-------------------+
      |                                           |
      |   (1) createAndStakeTask()                | (2) transferFrom()
      v                                           v
+-----------------------+              +-----------------------+
|  STAKE-TO-DONE        |              |  TREASURY / BURN      |
|  SMART CONTRACT       | <----------- |                       |
+-----------------------+              +-----------------------+
      |
      +--- (3a) IF Success -> completeTask() -> Refund to User
      |
      +--- (3b) IF Expired -> claimExpiredTask() -> Burn Stake
```

---

### 2. Smart Contract Code
The core contract `StakeToDone.sol` is optimized for Base with combined staking/creation logic to save gas.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StakeToDone is ReentrancyGuard {
    IERC20 public immutable stakingToken;
    address public immutable treasury;

    struct Task {
        uint256 id;
        address user;
        string description;
        uint256 stakeAmount;
        uint256 deadline;
        bool completed;
        bool claimed;
    }

    uint256 public nextTaskId;
    mapping(uint256 => Task) public tasks;
    mapping(address => uint256[]) public userTaskIds;

    constructor(address _token, address _treasury) {
        require(_token != address(0) && _treasury != address(0), "Invalid addresses");
        stakingToken = IERC20(_token);
        treasury = _treasury;
    }

    function createAndStakeTask(string memory _desc, uint256 _deadline, uint256 _amount) external nonReentrant {
        require(_deadline > block.timestamp, "Deadline must be future");
        require(_amount > 0, "Stake must be > 0");
        
        uint256 taskId = nextTaskId++;
        tasks[taskId] = Task(taskId, msg.sender, _desc, _amount, _deadline, false, false);
        userTaskIds[msg.sender].push(taskId);

        require(stakingToken.transferFrom(msg.sender, address(this), _amount), "Stake failed");
    }

    function completeTask(uint256 _taskId) external nonReentrant {
        Task storage task = tasks[_taskId];
        require(task.user == msg.sender, "Not owner");
        require(!task.completed && !task.claimed, "Already resolved");
        require(block.timestamp <= task.deadline, "Deadline passed");

        task.completed = true;
        require(stakingToken.transfer(msg.sender, task.stakeAmount), "Refund failed");
    }

    function claimExpiredTask(uint256 _taskId) external nonReentrant {
        Task storage task = tasks[_taskId];
        require(!task.completed && !task.claimed, "Already resolved");
        require(block.timestamp > task.deadline, "Not expired");
        require(task.stakeAmount > 0, "No stake");

        task.claimed = true;
        require(stakingToken.transfer(treasury, task.stakeAmount), "Burn failed");
    }
}
```

---

### 3. Frontend Implementation
The frontend uses the **Platinum Luxury Design System** (Vanilla CSS + React).
- **Branding**: Outfit Font + Animated Gradients.
- **Glassmorphism**: 20px Blur + Glow Effects.
- **Logic**: Combined `createAndStake` handling for seamless UX.

**Key Components Hierarchy:**
- `App.jsx`: State & Protocol Sync.
- `Hero.jsx`: Liquidity & Branding.
- `TaskForm.jsx`: Luxury Input & Staking.
- `TaskItem.jsx`: Logic-Heavy Task Visualization.
- `index.css`: Nuclear CSS tokens.

---

### 4. Deployment Guide
1. **Contract**: 
   - Set `.env` (PRIVATE_KEY, BASE_SEPOLIA_RPC).
   - `npx hardhat run scripts/deploy.js --network baseSepolia`.
2. **Frontend Config**: Update `constants.js` with new addresses.
3. **Vercel**: Push to repository. Vercel will build from `frontend/dist` using `vercel.json` routing.

---

### 5. Testing (Mocha/Chai)
We verify 4 core states:
1. **Creation**: Task maps correctly to user.
2. **Staking**: Tokens are moved from user to contract.
3. **Completion**: Tokens return ONLY before deadline.
4. **Burning**: Tokens move to Treasury ONLY after deadline.

---

### 6. Security Review
- **Re-entrancy Guard**: Every state-changing function uses `nonReentrant`.
- **Logic Barrier**: Tasks cannot be double-resolved (completed AND claimed).
- **Access Control**: Users can only complete their own tasks.

---

### 7. Improvements
- **Chainlink Keepers**: Automate slashing so users don't have to trigger `claimExpiredTask` manually.
- **AI Verification**: Integration with GPT-4V to verify task screenshots.
- **Base Names**: Display protocol IDs as user-friendly Base Names.

---
**STATUS: PLATINUM MVP DEPLOYMENT READY.**
🚀🔥🚢💎
