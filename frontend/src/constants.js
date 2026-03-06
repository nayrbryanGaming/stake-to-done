
export const STAKE_TO_DONE_ADDRESS = "0x3700cd6C65f2Fd13c02B1A3FF4cF250E83827000E";
export const MOCK_USDC_ADDRESS = "0x19F746D98e1Ed30a75A52287700AdaEf4618673Df";

export const STAKE_TO_DONE_ABI = [
    {
        "inputs": [
            { "internalType": "string", "name": "_description", "type": "string" },
            { "internalType": "uint256", "name": "_deadline", "type": "uint256" }
        ],
        "name": "createTask",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_taskId", "type": "uint256" },
            { "internalType": "uint256", "name": "_amount", "type": "uint256" }
        ],
        "name": "stakeTask",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_taskId", "type": "uint256" }],
        "name": "completeTask",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_taskId", "type": "uint256" }],
        "name": "claimExpiredTask",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
        "name": "getUserTasks",
        "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "name": "tasks",
        "outputs": [
            { "internalType": "uint256", "name": "id", "type": "uint256" },
            { "internalType": "address", "name": "user", "type": "address" },
            { "internalType": "string", "name": "description", "type": "string" },
            { "internalType": "uint256", "name": "stakeAmount", "type": "uint256" },
            { "internalType": "uint256", "name": "deadline", "type": "uint256" },
            { "internalType": "bool", "name": "completed", "type": "bool" },
            { "internalType": "bool", "name": "claimed", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

export const MOCK_USDC_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "spender", "type": "address" },
            { "internalType": "uint256", "name": "value", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "owner", "type": "address" },
            { "internalType": "address", "name": "spender", "type": "address" }
        ],
        "name": "allowance",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
