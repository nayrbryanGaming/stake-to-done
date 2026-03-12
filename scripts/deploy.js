const hre = require("hardhat");

async function main() {
    console.log("Starting deployment on Base Sepolia...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // 1. Deploy MockUSDC
    console.log("Deploying MockUSDC...");
    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();
    const mockUSDCAddress = await mockUSDC.getAddress();
    console.log("MockUSDC deployed to:", mockUSDCAddress);

    // 2. Deploy StakeToDone
    const treasury = process.env.TREASURY_ADDRESS || deployer.address;
    console.log("Deploying StakeToDone with treasury:", treasury);
    const StakeToDone = await hre.ethers.getContractFactory("StakeToDone");
    const stakeToDone = await StakeToDone.deploy(mockUSDCAddress, treasury);
    await stakeToDone.waitForDeployment();
    const stakeToDoneAddress = await stakeToDone.getAddress();
    console.log("StakeToDone deployed to:", stakeToDoneAddress);

    console.log("\nDeployment Summary:");
    console.log("-------------------");
    console.log("MockUSDC:   ", mockUSDCAddress);
    console.log("StakeToDone:", stakeToDoneAddress);
    console.log("Treasury:   ", treasury);
    console.log("\nUpdating frontend constants...");

    // Optional: Write to a file for easier frontend integration
    const fs = require("fs");
    const path = require("path");
    const addresses = {
        STAKE_TO_DONE_ADDRESS: stakeToDoneAddress,
        USDC_ADDRESS: mockUSDCAddress,
        TREASURY_ADDRESS: treasury,
        NETWORK: "Base Sepolia"
    };

    fs.writeFileSync(
        path.join(__dirname, "../addresses.json"),
        JSON.stringify(addresses, null, 2)
    );

    // Also update frontend constants.js automatically
    const constantsPath = path.join(__dirname, "../frontend/src/constants.js");
    if (fs.existsSync(constantsPath)) {
        let content = fs.readFileSync(constantsPath, "utf8");
        content = content.replace(/export const STAKE_TO_DONE_ADDRESS = "0x[a-fA-F0-9]+";/g, `export const STAKE_TO_DONE_ADDRESS = "${stakeToDoneAddress}";`);
        content = content.replace(/export const USDC_ADDRESS = "0x[a-fA-F0-9]+";/g, `export const USDC_ADDRESS = "${mockUSDCAddress}";`);

        // Safety fallback if regex fails to find the exact line (e.g. if I changed it slightly)
        if (!content.includes(stakeToDoneAddress)) {
            // Just prepend/replace at start if regex is too brittle
            const lines = content.split('\n');
            lines[0] = `export const STAKE_TO_DONE_ADDRESS = "${stakeToDoneAddress}";`;
            lines[1] = `export const USDC_ADDRESS = "${mockUSDCAddress}";`;
            content = lines.join('\n');
        }

        fs.writeFileSync(constantsPath, content);
        console.log("Frontend constants.js synchronized.");
    }

    console.log("Address configuration saved to addresses.json");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
