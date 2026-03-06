# StakeToDone Protocol

StakeToDone is an onchain productivity commitment protocol built on Base.

It allows users to stake crypto to commit to completing tasks.  
If the task is completed before the deadline, the stake is returned.  
If the task fails, the stake is burned or redistributed.

The protocol leverages behavioral economics and smart contracts to create stronger accountability than traditional productivity apps.

---

# Problem

Millions of people struggle with procrastination.

Traditional productivity tools rely only on motivation and reminders.

They cannot enforce real commitment.

In behavioral psychology, **loss aversion** shows that people are more motivated to avoid losing money than to gain rewards.

StakeToDone introduces financial accountability into productivity.

---

# Solution

StakeToDone transforms tasks into onchain commitments.

Users stake crypto when creating a task.

If the task is completed before the deadline:

User receives their funds back.

If the task is not completed:

Funds are automatically burned or redistributed.

This creates a powerful incentive to complete commitments.

---

# How It Works

User flow:

1. Connect wallet
2. Create task
3. Stake tokens
4. Wait until deadline
5. Mark task completed

Outcome:

Completed → stake returned  
Failed → stake burned or sent to treasury

---

# Example

User creates task:

Finish coding MVP

Stake:

1 USDC

Deadline:

24 hours

If completed:

User gets back 1 USDC.

If failed:

Stake is burned.

---

# Why Blockchain

Traditional apps cannot safely hold user funds without trust.

Smart contracts allow:

Trustless escrow  
Automatic execution  
Transparent rules

This makes financial commitment mechanisms possible.

---

# Built On

Base Network

StakeToDone is deployed on Base because of:

Low transaction fees  
Fast confirmations  
Ethereum compatibility

---

# Tech Stack

**Smart Contracts**
- Solidity
- Hardhat

**Frontend**
- React + Vite
- Tailwind CSS / Premium CSS Modules

**Wallet Integration**
- wagmi
- viem

**Wallet**
- MetaMask

**Token**
- USDC (ERC20)

---

# Project Architecture

```
User
↓
Frontend (React)
↓
Wallet Connection
↓
Smart Contract
↓
Base Network
```

---

# Repository Structure

```
stake-to-done/
├── contracts/
│   └── StakeToDone.sol
├── scripts/
│   └── deploy.js
├── tests/
│   └── stakeToDone.test.js
├── frontend/
│   ├── src/
│   └── public/
└── README.md
```

---

# Smart Contract Overview

The core contract manages task commitments.

Task structure:
```solidity
struct Task {
    address user;
    string description;
    uint256 stakeAmount;
    uint256 deadline;
    bool completed;
}
```

Core functions:
- `createTask()`
- `stakeTask()`
- `completeTask()`
- `claimExpiredTask()`

---

# Installation

1. Clone the repository:
```bash
git clone https://github.com/nayrbryanGaming/stake-to-done.git
cd stake-to-done
```

2. Install dependencies:
```bash
npm install
cd frontend
npm install
```

---

# Running the Frontend

Navigate to the frontend folder and start the dev server:
```bash
cd frontend
npm run dev
```
Local server will start at [http://localhost:5173](http://localhost:5173).

---

# Deploy Smart Contract

You can deploy using Hardhat:
```bash
npx hardhat run scripts/deploy.js --network base_sepolia
```

Or use Remix:
1. Open [Remix](https://remix.ethereum.org).
2. Create `StakeToDone.sol`.
3. Compile and deploy using **Injected Provider (MetaMask)** on **Base Sepolia Testnet**.

---

# Security Considerations

Smart contracts should be audited before production. Key considerations:
- Reentrancy protection (implemented).
- Token approval handling.
- Deadline validation.

---

# Roadmap

**Phase 1**
- MVP smart contract
- Basic task staking
- Premium Frontend dashboard (In Progress)

**Phase 2**
- Leaderboard
- Task history
- User profiles

**Phase 3**
- Mobile app
- Social accountability features
- DAO governance

---

# License

MIT License
