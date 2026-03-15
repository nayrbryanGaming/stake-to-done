import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const rpcUrl = process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org";
  const privateKey = process.env.PRIVATE_KEY;
  const targetAddress = "0x685cD40E2E458AfFA00Fe5e4900E478CB66Db70";
  const amount = ethers.parseUnits("0.1", "ether");

  if (!privateKey) {
    console.error("PRIVATE_KEY not found in .env");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const balance = await provider.getBalance(wallet.address);
  console.log(`Deployer balance: ${ethers.formatEther(balance)} ETH`);

  console.log(`Sending ${ethers.formatEther(amount)} Base Sepolia ETH to ${targetAddress}...`);

  const tx = await wallet.sendTransaction({
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
