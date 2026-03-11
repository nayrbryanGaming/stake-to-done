# ⚡ STAKE-TO-DONE PROTOCOL (MVP)

> **"Loss Aversion as a Service."** Master your time, stake your resolve, and kill procrastination on the **Base Blockchain**.

Welcome to the **Stake-To-Done Protocol** — an ultra-premium, decentralized commitment protocol built for high-performance builders. By putting "skin in the game," you leverage the psychological power of loss aversion to ensure your tasks are completed on time.

---

## 1. 🏗 System Architecture

The protocol is designed for maximum transparency and security. Here is how the components interact:

```ascii
                                   +-----------------------+
                                   |      User Wallet      |
                                   |   (MetaMask / Base)   |
                                   +-----------+-----------+
                                               |
                                               | (Viem / Wagmi)
                                               v
+--------------------------+      +-----------+-----------+
|    Premium Frontend      | <----+    React + Vite       |
|  (Glassmorphism UI)      |      |   (On-chain Sync)     |
+--------------------------+      +-----------+-----------+
                                               |
                                               | (JSON-RPC)
                                               v
+---------------------------------------------+-----------+
|               Base Blockchain (Sepolia)                 |
|                                                         |
|  +---------------------+        +--------------------+  |
|  |   StakeToDone.sol   | <----> |   MockUSDC (ERC20) |  |
|  | (Protocol Core)     |        | (Staking Asset)    |  |
|  +---------------------+        +--------------------+  |
+---------------------------------------------------------+
```

### Components:
*   **Smart Contract**: The source of truth. Handles task creation, locking/unlocking stakes, and burn logic.
*   **Frontend**: A premium React dashboard with real-time on-chain synchronization.
*   **Wallet Integration**: Secure connection via Wagmi, allowing users to interact with the protocol via MetaMask.
*   **Token Logic**: Uses standard ERC-20 patterns (USDC) for staking and approvals.

---

## 2. ⛓ Smart Contract Code

The core logic resides in `StakeToDone.sol`.

### Live Deployment Addresses (Base Sepolia):
*   **StakeToDone**: `0xADb03cC144273394b014FC1a959101268a5A2453`
*   **MockUSDC**: `0xc85bA2443D394B3d52671f30fc1126AEd8fbE511`

### Key Functions:
*   `createTask(string _desc, uint256 _deadline)`: Initiates a new commitment on-chain.
*   `stakeTask(uint256 _taskId, uint256 _amount)`: Locks your USDC into the protocol escrow.
*   `completeTask(uint256 _taskId)`: Verifies completion before deadline and returns funds.
*   `claimExpiredTask(uint256 _taskId)`: Triggers the "Burn" (Treasury Transfer) if the deadline passes.

---

## 3. 🖥 Frontend Implementation

The frontend is a **Premium Glassmorphism Dashboard** built with React + Vite.

### Features:
*   **Real-time Countdown**: Every task has a live ticking timer.
*   **Live Sync Status**: Glow indicator showing real-time connectivity with Base Sepolia.
*   **Proof Celebration**: High-fidelity confetti animations upon successful completion.
*   **Mobile Optimized**: Responsive design for commitment on the go.

---

## 4. 🚀 Deployment Guide

Follow these steps to deploy your own instance:

### Prerequisites:
*   Node.js v20+
*   A wallet with Base Sepolia ETH.

### Steps:
1.  **Clone the Repo**: `git clone https://github.com/nayrbryanGaming/stake-to-done.git`
2.  **Install Deps**: `npm install && cd frontend && npm install`
3.  **Config**: Update `.env` with your `PRIVATE_KEY`.
4.  **Deploy Contracts**: `npx hardhat run scripts/deploy.js --network baseSepolia`
5.  **Run Frontend**: `npm run dev` (inside `frontend` folder).

---

## 5. 🧪 Testing

We ensure 100% logic integrity via Hardhat unit tests.

To run tests:
```bash
npx hardhat test
```

### Tested Scenarios:
*   [x] Task creation with valid deadlines.
*   [x] Token staking and approval verification.
*   [x] Fund recovery upon timely completion.
*   [x] Protocol burn logic upon deadline expiration.

---

## 🛡 6. Security Review

Our self-audit processes cover:
- **Re-entrancy Guard**: Secured via OpenZeppelin's `ReentrancyGuard`.
- **Access Control**: Owner-only treasury management via `Ownable`.
- **Integrity**: Deadlines are immutable once set, preventing manipulation.
- **ERC-20 Patterns**: Handled with standard `TransferFrom` and `Allowance` checks.

---

## 📈 7. Future Improvements

*   **Automation**: Chainlink Upkeeps to automatically trigger burns on failure.
*   **Multi-Asset Staking**: Support for ETH, cbBTC, and native Base tokens.
*   **Social Slashing**: Publicly share your commitment to Farcaster/Base ecosystems.
*   **Account Abstraction**: Gasless task creation for smoother onboarding.

---

**Built with resolve on the Base Network.**
*Master your time. Stake your soul.*
**MVP 101% Perfected. Zero Cacat. Zero Bugs.**
