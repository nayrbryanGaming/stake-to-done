require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const rawPrivateKey = (process.env.PRIVATE_KEY || "").trim();
const isValidPrivateKey = /^(0x)?[0-9a-fA-F]{64}$/.test(rawPrivateKey);
const normalizedPrivateKey = rawPrivateKey.startsWith("0x")
    ? rawPrivateKey
    : `0x${rawPrivateKey}`;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
        baseSepolia: {
            url: process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org",
            // Keep config safe for local dev when PRIVATE_KEY is intentionally blank/placeholder.
            accounts: isValidPrivateKey ? [normalizedPrivateKey] : [],
        },
    },
    etherscan: {
        apiKey: {
            baseSepolia: "placeholder",
        },
        customChains: [
            {
                network: "baseSepolia",
                chainId: 84532,
                urls: {
                    apiURL: "https://api-sepolia.basescan.org/api",
                    browserURL: "https://sepolia.basescan.org",
                },
            },
        ],
    },
};
