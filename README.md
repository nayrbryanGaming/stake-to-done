# Stake-To-Done Protocol

Decentralized productivity protocol on Base where users stake USDC for task commitments.

## 1. System Architecture

```ascii
+------------------+          +---------------------------+
| Browser + Wallet | <------> | React + Wagmi + Viem UI  |
| (MetaMask)       |          | (frontend)               |
+--------+---------+          +------------+--------------+
         |                                 |
         | JSON-RPC                        | Contract calls
         v                                 v
+----------------------------------------------------------+
| Base Sepolia                                              |
|  +----------------------+   +--------------------------+  |
|  | StakeToDone.sol      |   | MockUSDC.sol (ERC-20)   |  |
|  | - create task        |   | - 6 decimals            |  |
|  | - stake              |   | - mint for testnet      |  |
|  | - complete           |   +--------------------------+  |
|  | - claim expired      |                                   |
|  +----------------------+                                   |
+----------------------------------------------------------+
```

## 2. Smart Contract Code

- Core contract: `contracts/StakeToDone.sol`
- Mock staking token: `contracts/MockUSDC.sol`

Main rules:
- `createTask`: description must not be empty, deadline must be future.
- `stakeTask`: only task owner, one-time stake, before deadline.
- `completeTask`: only owner, before deadline, returns staked tokens.
- `claimExpiredTask`: after deadline, sends stake to treasury.
- Reentrancy protected with `ReentrancyGuard`.

## 3. Frontend Implementation

- Stack: React + Vite + Wagmi + Viem
- Main files:
  - `frontend/src/App.jsx`
  - `frontend/src/components/TaskForm.jsx`
  - `frontend/src/components/TaskItem.jsx`
  - `frontend/src/components/Layout.jsx`
  - `frontend/src/components/Hero.jsx`

Implemented UI features:
- Connect/disconnect wallet
- Create + stake task in one flow
- Approve USDC when allowance is missing
- Complete task before deadline
- Claim expired task (funds go to treasury)
- Live countdown per task

## 4. Deployment Guide

1. Install dependencies:
```bash
npm install --workspaces=false
npm --prefix frontend install
```

2. Configure `.env` at project root:
```bash
BASE_SEPOLIA_RPC=https://sepolia.base.org
PRIVATE_KEY=YOUR_PRIVATE_KEY
TREASURY_ADDRESS=YOUR_TREASURY_ADDRESS
```

3. Deploy:
```bash
npm run deploy:base
```

4. Sync deployed addresses to frontend:
- Script writes `addresses.json`
- Script updates `frontend/src/constants.js` automatically

5. Run frontend:
```bash
npm --prefix frontend run dev
```

## 5. Testing

Run smart contract tests:
```bash
npm test
```

Current test file:
- `test/StakeToDone.js`

Covered flows:
- task creation
- staking
- complete before deadline
- claim after deadline
- create and stake in one tx

## 6. Security Review

Implemented controls:
- Reentrancy guard on transfer functions
- Explicit task existence checks
- Deadline validation
- Double-processing prevention (`completed/claimed`)
- Owner-only treasury update
- ERC-20 transfer return-value checks

Operational notes:
- Never commit real private keys to git.
- Rotate leaked keys immediately.

## 7. Improvements

Recommended next iterations:
- Add event indexing + pagination for task history
- Add role-based treasury controls (multisig)
- Add gas snapshots in CI
- Add E2E tests for frontend transaction flows
- Add Chainlink Automation for periodic expired-task processing
