# StakeToDone Protocol

StakeToDone is an ultra-premium, onchain productivity commitment protocol built on the **Base Network**.

It allows users to stake crypto (USDC) to commit to completing tasks.  
If the task is completed before the deadline, the stake is returned.  
If the task fails, the stake is burned or sent to a treasury.

The protocol leverages **Loss Aversion** from behavioral economics to create the strongest accountability mechanism in Web3.

---

## 🏗 System Architecture

```ascii
                                  +-----------------------+
                                  |      User Wallet      |
                                  |   (MetaMask / Base)   |
                                  +-----------+-----------+
                                              |
                                              | (Wagmi / Viem)
                                              v
+--------------------------+      +-----------+-----------+
|    Premium Frontend      | <----+    React + Vite       |
|  (Glassmorphism UI)      |      |   (Wagmi Hooks)       |
+--------------------------+      +-----------+-----------+
                                              |
                                              | (JSON-RPC)
                                              v
+---------------------------------------------+-----------+
|               Base Blockchain (Sepolia)                 |
|                                                         |
|  +---------------------+        +--------------------+  |
|  |   StakeToDone.sol   | <----> |   MockUSDC (ERC20) |  |
|  | (Protocol Logic)    |        | (Staking Asset)    |  |
|  +---------------------+        +--------------------+  |
+---------------------------------------------------------+
```

---

## ⚡ Core Concept

### The Problem
Procrastination is often caused by a lack of immediate consequences. Traditional productivity apps rely on motivation—which is fleeting.

### The Solution
StakeToDone transforms tasks into financial commitments. By putting "skin in the game," users trigger **Loss Aversion**, making the cost of failure tangible and immediate.

---

## 🚀 Features

- **Onchain Commitments**: Every task is recorded on the Base blockchain.
- **USDC Staking**: Users lock a specific amount of USDC to prove resolve.
- **Deadline Enforcer**: Smart contracts handle the expiration and penalty logic automatically.
- **Ultra-Premium UI**: Glassmorphic design system with vibrant mesh gradients for a "Wow" experience.
- **Protocol Transparency**: All stakes and burns are visible on-chain.

---

## 🛠 Tech Stack

- **L2 Blockchain**: [Base](https://base.org) (Sepolia Testnet)
- **Smart Contracts**: Solidity ^0.8.20 (Hardhat)
- **Frontend**: React + Vite + Tailwind CSS
- **Interactions**: Wagmi + Viem
- **Provider**: Injected Wallet (MetaMask)

---

## 🔐 Security & Bug Detection

During the "Perfection" phase, a self-audit was conducted:

1. **Re-entrancy Protection**: Implemented `ReentrancyGuard` on all state-changing functions.
2. **Deadline Validation**: Strict validation ensures tasks cannot be completed after the deadline.
3. **Escrow Safety**: Funds are held in the contract and only released upon valid proof of completion or expiration.
4. **Approval Check**: Frontend ensures USDC allowance is handled before staking.
5. **Ownership**: Treasury management is restricted to the contract owner.

---

## 📈 Roadmap & Improvements

### Phase 1 (MVP - Current)
- [x] Basic Staking & Completion
- [x] Premium UI/UX Overhaul
- [x] Base Sepolia Deployment

### Phase 2 (Growth)
- [ ] **Leaderboards**: Track the most disciplined users.
- [ ] **Chainlink Automation**: Automate the `claimExpiredTask` function for hands-off burning.
- [ ] **Social Slashing**: Allow friends to verify tasks (Proof of Peer).

### Phase 3 (Ecosystem)
- [ ] **Governance Token**: Participate in protocol parameters.
- [ ] **Mobile App**: Native iOS/Android experience.
- [ ] **API Integration**: Connect with Jira/Github to auto-verify tasks.

---

## 🚀 Getting Started

1. **Clone & Install**:
   ```bash
   git clone https://github.com/nayrbryanGaming/stake-to-done.git
   npm install
   ```
2. **Setup Frontend**:
   ```bash
   cd frontend && npm install
   npm run dev
   ```
3. **Deploy (Optional)**:
   ```bash
   npx hardhat run scripts/deploy.js --network base_sepolia
   ```

---

## 📜 License
MIT License. Built with resolve on Base.
