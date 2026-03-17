export const STAKE_TO_DONE_ADDRESS = "0xfd547B157f1926b0899CfEc1095eECE65e8cBEAc";
export const VERSION = "v2.3.3-base-sepolia";

export const STAKE_TO_DONE_ABI = [
    {
        "inputs": [
            { "internalType": "string", "name": "_description", "type": "string" },
            { "internalType": "uint256", "name": "_deadline", "type": "uint256" }
        ],
        "name": "createAndStakeTask",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "payable",
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
    },
    {
        "inputs": [
            { "internalType": "uint256[]", "name": "_ids", "type": "uint256[]" }
        ],
        "name": "getTaskDetails",
        "outputs": [
            {
                "components": [
                    { "internalType": "uint256", "name": "id", "type": "uint256" },
                    { "internalType": "address", "name": "user", "type": "address" },
                    { "internalType": "string", "name": "description", "type": "string" },
                    { "internalType": "uint256", "name": "stakeAmount", "type": "uint256" },
                    { "internalType": "uint256", "name": "deadline", "type": "uint256" },
                    { "internalType": "bool", "name": "completed", "type": "bool" },
                    { "internalType": "bool", "name": "claimed", "type": "bool" }
                ],
                "internalType": "struct StakeToDonePure.Task[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
