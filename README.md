# StakeToDone Protocol

Onchain commitment protocol for productivity.
Stake crypto. Complete your task. Or lose your stake.

## Overview

StakeToDone is a decentralized productivity protocol built on Base Sepolia.

It transforms personal commitments into enforceable onchain actions by introducing financial accountability.

Users stake testnet ETH when committing to a task:

- Complete task: reclaim stake
- Miss deadline: stake can be claimed by treasury flow

This uses behavioral economics (loss aversion) to improve follow-through on real work.

## Problem

Procrastination is universal.

Most productivity apps rely on reminders and self-discipline only.
There is no hard consequence for not completing commitments.

## Solution

StakeToDone introduces financial commitment as a protocol primitive.

By staking ETH:

- users create real consequences,
- commitments become verifiable onchain,
- accountability becomes automatic.

No trusted middleman is required.

## How It Works

### User Flow

1. Connect wallet.
2. Create task description and deadline.
3. Stake Base Sepolia ETH.
4. Complete task before deadline or let it expire.
5. Execute completion or expiry claim flow onchain.

### Outcomes

| Status | Result |
| --- | --- |
| Completed | Funds can be reclaimed by task owner via completion flow |
| Expired | Funds can be moved by expiry claim flow (treasury path) |

## Example

Task: Finish MVP feature
Stake: 0.001 ETH (Base Sepolia)
Deadline: 24 hours

- Completed before deadline: user marks task complete
- Missed deadline: task becomes claimable by expiry logic

## Why Blockchain

Traditional apps cannot enforce trustless commitments.

Smart contracts provide:

- trustless escrow behavior,
- automatic execution,
- transparent state,
- no intermediary control.

## Built With

- Base Sepolia (Chain ID 84532)
- Solidity
- Hardhat
- React + Vite
- wagmi + viem
- TanStack Query

## Architecture

```ascii
+---------------------+        +------------------------------+
| Browser + Wallet    | <----> | React + Vite + Wagmi + Viem |
| MetaMask/Coinbase   |        | Frontend                     |
+----------+----------+        +---------------+--------------+
           |                                   |
           | JSON-RPC                          | Contract Calls
           v                                   v
+---------------------------------------------------------------+
| Base Sepolia (Chain ID 84532)                                |
|                                                               |
|  +---------------------------------------------------------+  |
|  | StakeToDonePure.sol                                     |  |
|  | - createAndStakeTask(description, deadline) payable     |  |
|  | - completeTask(taskId)                                  |  |
|  | - claimExpiredTask(taskId)                              |  |
|  | - getUserTasks(user) / getTaskDetails(ids)             |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

## Repository Structure

```text
stake-to-done/
|- contracts/
|  `- StakeToDonePure.sol
|- scripts/
|  |- deploy_pure.cjs
|  |- deploy.js
|  |- fund_user.js
|  `- check_balance.js
|- src/
|  |- App.jsx
|  |- wagmi.js
|  `- components/
|- test/
|  `- StakeToDone.cjs
|- addresses.json
`- hardhat.config.cjs
```

## Smart Contract Design

```solidity
struct Task {
    uint256 id;
    address user;
    string description;
    uint256 stakeAmount;
    uint256 deadline;
    bool completed;
    bool claimed;
}
```

Core functions:

- `createAndStakeTask(string,uint256)`
- `completeTask(uint256)`
- `claimExpiredTask(uint256)`
- `getUserTasks(address)`
- `getTaskDetails(uint256[])`

Key properties:

- stake is held by contract logic,
- deadline is enforced onchain,
- no centralized operator is needed,
- all task states are publicly auditable.

## Prerequisites

- Node.js 20+
- EVM wallet (MetaMask/Coinbase Wallet/etc.)
- Base Sepolia ETH for gas and stake

## Installation

```bash
npm install
```

Create `.env` in project root:

```env
BASE_SEPOLIA_RPC=https://sepolia.base.org
PRIVATE_KEY=YOUR_TESTNET_PRIVATE_KEY
TREASURY_ADDRESS=YOUR_TESTNET_WALLET_ADDRESS
```

Use a dedicated test wallet only. Never use a main wallet private key.

## Run Frontend

```bash
npm run dev
```

Open Vite local URL (usually `http://localhost:5173`).

## Deploy Contract

```bash
npx hardhat run scripts/deploy_pure.cjs --network baseSepolia
```

This updates `addresses.json` with deployed metadata, including version tag.

## Test

```bash
npx hardhat test
```

## Deploy Frontend

This project is configured for Vercel (`vercel.json` included).

1. Push repository to GitHub.
2. Import project in Vercel.
3. Deploy with build command `npm run build`.

## Security Notes

- Use `ReentrancyGuard` patterns where applicable.
- Validate deadlines and task ownership checks.
- Prevent double execution of completion/claim paths.
- Never commit secrets (`PRIVATE_KEY`, API keys, etc.).

This is an MVP and should be audited before production usage.

## Roadmap

### Phase 1

- Core staking and task lifecycle
- Wallet integration
- Basic dashboard and history

### Phase 2

- Leaderboard and profile layer
- Better analytics for completion rate
- Richer social proof elements

### Phase 3

- Group challenges
- Reputation primitives
- Mobile-first client

## Vision

StakeToDone aims to become a commitment layer for onchain productivity.

Potential expansions:

- habit staking,
- team accountability rails,
- DAO contributor commitment systems,
- AI-assisted execution workflows.

## Contributing

Contributions are welcome:

- UI/UX improvements,
- contract optimization,
- security hardening,
- feature development.

## License

MIT
