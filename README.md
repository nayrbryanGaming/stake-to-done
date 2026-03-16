# Stake-To-Done Protocol

Stake-To-Done is a Web3 productivity app on Base Sepolia where users stake testnet ETH to commit to task completion.

## 1. System Architecture

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

## 2. Features

- Create task with deadline and ETH stake
- Complete task before deadline to reclaim stake
- Claim expired task to treasury after deadline
- Wallet integration with Base Sepolia only
- Task history and live countdown UI

## 3. Project Structure

- `contracts/StakeToDonePure.sol`: ETH-based smart contract
- `src/`: React frontend
- `scripts/deploy_pure.cjs`: deployment script (Base Sepolia)
- `test/`: Hardhat unit tests
- `addresses.json`: deployed contract metadata

## 4. Prerequisites

- Node.js 20+
- MetaMask (or other EVM wallet)
- Base Sepolia testnet ETH balance in wallet

## 5. Setup

```bash
npm install
```

Create `.env` in project root:

```env
BASE_SEPOLIA_RPC=https://sepolia.base.org
PRIVATE_KEY=YOUR_TESTNET_PRIVATE_KEY
TREASURY_ADDRESS=YOUR_TESTNET_WALLET_ADDRESS
```

Important: use a dedicated test wallet. Never use a main wallet private key.

## 6. Run Frontend

```bash
npm run dev
```

Open local URL shown by Vite (usually `http://localhost:5173`).

## 7. Deploy Contract (Base Sepolia)

```bash
npx hardhat run scripts/deploy_pure.cjs --network baseSepolia
```

This updates `addresses.json` with:
- `STAKE_TO_DONE_ADDRESS`
- `TREASURY_ADDRESS`
- `NETWORK`
- `VERSION`

## 8. Tests

```bash
npx hardhat test
```

## 9. Network Configuration

Set your wallet to:

- Network Name: `Base Sepolia`
- RPC URL: `https://sepolia.base.org`
- Chain ID: `84532`
- Currency Symbol: `ETH`
- Block Explorer: `https://sepolia.basescan.org`

## 10. FAQ (Exam Notes)

### Why does transaction still require ETH if this is testnet?

Because ETH is used as gas fee by the blockchain network.
In this project, gas uses Base Sepolia testnet ETH (not mainnet ETH).
Base Sepolia ETH here is testnet-only and has no mainnet monetary value.

### Why is USDC removed and replaced with ETH-only?

This repository now uses a single contract flow with native ETH only:
- Stake is sent through `msg.value` in `createAndStakeTask`.
- No ERC-20 approval step is required.
- No USDC contract address is needed in frontend or scripts.

### Why can browser with wallet extension show more errors?

Wallet extensions inject providers and can trigger extra chain/network checks.
If network is not Base Sepolia, the app blocks actions and asks for network switch.
Use one active wallet extension at a time and ensure chain is `84532`.

### Why can wallet show 0 ETH on Base Sepolia?

Common causes:
- Wallet still on wrong network (not Base Sepolia)
- Funds sent to a different wallet address
- Transfer transaction not yet confirmed
- RPC endpoint lagging (switch RPC and retry)

### How to hard refresh if page looks stale?

- `Ctrl + Shift + R` or `Ctrl + F5`
- If keyboard shortcut conflicts, open Incognito and load again
- In DevTools Network tab, enable `Disable cache` and reload

## 11. Security Notes

- Use testnet wallet only
- Rotate any exposed private key immediately
- Do not commit `.env` or secrets into git

## 12. License

MIT
