const hre = require("hardhat");

async function main() {
    console.log("Starting deployment of StakeToDonePure on Base Sepolia...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const treasury = process.env.TREASURY_ADDRESS || deployer.address;
    console.log("Deploying StakeToDonePure with treasury:", treasury);

    const StakeToDonePure = await hre.ethers.getContractFactory("StakeToDonePure");
    const stakeToDonePure = await StakeToDonePure.deploy(treasury);
    await stakeToDonePure.waitForDeployment();
    
    const address = await stakeToDonePure.getAddress();
    console.log("StakeToDonePure deployed to:", address);

    const fs = require("fs");
    const path = require("path");

    // Save frontend/runtime addresses for ETH-only setup.
    const addressFile = path.join(__dirname, "../addresses.json");
    const addresses = {
        STAKE_TO_DONE_ADDRESS: address,
        TREASURY_ADDRESS: treasury,
        NETWORK: "Base Sepolia",
        VERSION: "v2.3.9-base-sepolia"
    };
    fs.writeFileSync(addressFile, JSON.stringify(addresses, null, 2));

    console.log("Deployment complete. ETH-only Base Sepolia configuration is active.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
