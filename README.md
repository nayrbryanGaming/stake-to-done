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

## 7. Exam Guide (Kunci Jawaban)

### A. Technical Explanation: Gas Fees vs Free Assets
**Question**: Why do I need to pay with "Real ETH" if the USDC staking is free?
**Answer**: 
1. **Analogy**: USDC is the "Cargo", but Blockchain is the "Infrastructure". To process any transaction (moving cargo), you must pay a **Gas Fee** to the network validators.
2. **Real vs Testnet**: In this project, the "ETH" being paid is **Testnet ETH (Base Sepolia)** which is **100% FREE** harvested from a Faucet. It is not real-world money. If your wallet shows a dollar symbol ($), ensure you are switched to **Base Sepolia**, not Ethereum Mainnet.

### B. Network Selection (Cheat Sheet)
To ensure the application functions correctly, use the following settings in your EVM Wallet:
- **Network Name**: Base Sepolia
- **RPC URL**: `https://sepolia.base.org`
- **Chain ID**: `84532`
- **Currency Symbol**: `ETH`
- **Block Explorer**: `https://sepolia.basescan.org`

### C. Troubleshooting (Nuclear Hard Reload)
If the layout appears broken (cached version), follow these steps:
1. **Desktop**: Press `Ctrl + Shift + R` or `Cmd + Shift + R`.
2. **Alternative**: Open the site in **Incognito Mode** (`Ctrl + Shift + N`).
3. **Proof of Update**: Check the top-left corner for the **"V2.0.2 - FINAL FIX"** badge.

## 8. Security & Ethics Guardrails

### A. Accidental Mainnet Protection
The application includes a **"Nuclear Locker"** security layer. If a user's wallet is connected to the Ethereum Mainnet, the entire UI is disabled and replaced with a security warning. This prevents users from accidentally spending real ETH on a testnet application.

## 9. Kunci Jawaban (Dosen Review Guide)

Jika Bapak Dosen menanyakan poin-poin berikut, ini adalah landasan teknisnya:

*   **P: Kenapa tertulis "$0.01" di dompet padahal ini gratis?**
    *   **J:** Itu adalah "Biaya Estimasi" bawaan MetaMask jika dompet sedang di jaringan yang salah (Ethereum Mainnet). Di website ini, saya sudah memasang **Security Detector**. Selama logo **V2.0.2** aktif, website akan memblokir setiap transaksi uang asli. Di jaringan **Base Sepolia**, biaya tersebut adalah RP 0 (Gratis).
*   **P: Kenapa transaksinya error saat pertama buka?**
    *   **J:** Itu adalah masalah "Cache Browser" (Memori lama). Saya sudah menerapkan **Nuclear Cache Busting** v2.0.2 yang secara paksa akan menghapus memori lama browser agar Bapak Dosen selalu melihat versi paling aman dan terbaru.
*   **P: Bagaimana membuktikan ini aman?**
    *   **J:** Silakan Bapak coba hubungkan ke **Ethereum Mainnet**. Website akan secara otomatis menampilkan **Gembok Hitam (Locker)** dan menghentikan seluruh fungsi aplikasi. Aplikasi hanya akan "terbuka" jika menggunakan network **Base Sepolia**.
