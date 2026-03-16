const hre = require("hardhat");

async function main() {
    console.log("Starting deployment of PURE ETH VERSION on Base Sepolia...");

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
    
    // Save to addresses.json
    const addressFile = path.join(__dirname, "../addresses.json");
    const currentAddresses = fs.existsSync(addressFile) ? JSON.parse(fs.readFileSync(addressFile)) : {};
    currentAddresses.STAKE_TO_DONE_ADDRESS = address;
    currentAddresses.VERSION = "v2.1.0-pure-eth";
    fs.writeFileSync(addressFile, JSON.stringify(currentAddresses, null, 2));

    console.log("Deployment complete. Version v2.1.0-pure-eth (Pure ETH) is active.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
