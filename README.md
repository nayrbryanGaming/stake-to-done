# Stake-To-Done Protocol MVP

A decentralized productivity commitment protocol on the Base blockchain.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    cd frontend && npm install
    ```

2.  **Environment Setup**:
    Create a `.env` file in the root:
    ```
    PRIVATE_KEY=your_private_key_here
    ```

3.  **Run Locally**:
    ```bash
    cd frontend
    npm run dev
    ```

## Smart Contracts (Base Sepolia)
- **StakeToDone**: `0x3700cd6C65f2Fd13c02B1A3FF4cF250E83827000E`
- **Mock USDC**: `0x19F746D98e1Ed30a75A52287700AdaEf4618673Df`

## Features
- Create tasks with description and deadline.
- Stake Mock USDC to commit to a task.
- Complete task before deadline to get funds back.
- Funds sent to treasury if task expires without completion.
