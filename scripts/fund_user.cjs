const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const targetAddress = "0x685cD40E2E458AfFA00Fe5e4900E478CB66Db70";
  const amount = ethers.parseEther("0.1");

  console.log(`Sending ${ethers.formatEther(amount)} Base Sepolia ETH to ${targetAddress}...`);

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  
  if (balance < amount) {
    console.error("Sender has insufficient balance. Top up Base Sepolia ETH and retry.");
    process.exit(1);
  }

  const tx = await deployer.sendTransaction({
    to: targetAddress,
    value: amount,
  });

  console.log("Transaction submitted:", tx.hash);
  await tx.wait(1);
  console.log("Transaction confirmed!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
