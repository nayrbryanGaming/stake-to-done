# Stake-To-Done Protocol

Decentralized commitment protocol on Base where users stake assets for task completion.

## 1. System Architecture

```ascii
+------------------+          +---------------------------+
| Browser + Wallet | <------> | React + Wagmi + Viem UI  |
| (MetaMask)       |          | (Vite Implementation)    |
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

## 2. Technical Stack

- **Smart Contracts**: Solidity (Hardhat)
- **Frontend**: React, Vite, Framer Motion
- **Web3 Layer**: Wagmi, Viem, TanStack Query
- **Styling**: Vanilla CSS (Premium Glassmorphism)

## 3. Directory Structure

- `src/`: Frontend React components and logic
- `contracts/`: Solidity smart contracts
- `test/`: Hardhat unit tests
- `scripts/`: Deployment and utility scripts
- `public/`: Static assets

## 4. Setup and Deployment

1. **Installation**:
```bash
npm install
```

2. **Configuration**:
Create a `.env` file at the root:
```bash
BASE_SEPOLIA_RPC=https://sepolia.base.org
PRIVATE_KEY=YOUR_PRIVATE_KEY
TREASURY_ADDRESS=YOUR_TREASURY_ADDRESS
```

3. **Development**:
```bash
npm run dev
```

4. **Production Build**:
```bash
npm run build
```

## 5. Security and Compliance

Implemented controls:
- Reentrancy protection (OpenZeppelin)
- Strict deadline validation
- Multi-phase status checks
- Owner-only administrative controls
- 100% open-source and auditable code

## 6. License

Distributed under the MIT License. See `LICENSE` for more information.
