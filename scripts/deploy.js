const hre = require("hardhat");

async function main() {
    console.log("Deploying StakeToDone protocol...");

    // 1. Deploy Mock USDC (for testing)
    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();
    const mockUsdcAddress = await mockUSDC.getAddress();
    console.log("MockUSDC deployed to:", mockUsdcAddress);

    // 2. Deploy StakeToDone with Mock USDC as the staking token
    // Treasury will be the deployer for this MVP
    const [deployer] = await hre.ethers.getSigners();
    const StakeToDone = await hre.ethers.getContractFactory("StakeToDone");
    const stakeToDone = await StakeToDone.deploy(mockUsdcAddress, deployer.address);
    await stakeToDone.waitForDeployment();
    const stakeToDoneAddress = await stakeToDone.getAddress();

    console.log("StakeToDone deployed to:", stakeToDoneAddress);
    console.log("Treasury address set to:", deployer.address);

    console.log("\n--- Deployment Summary ---");
    console.log("Mock USDC:", mockUsdcAddress);
    console.log("StakeToDone:", stakeToDoneAddress);
    console.log("--------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
