import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function run() {
  try {
    console.log("Funding wallet: 0x685cD40E2E458AfFA00Fe5e4900E478CB66Db70");
    const tx = await wallet.sendTransaction({
      to: "0x685cD40E2E458AfFA00Fe5e4900E478CB66Db70",
      value: ethers.parseEther("0.1")
    });
    console.log("Tx Hash:", tx.hash);
    await tx.wait();
    console.log("Done!");
  } catch (e) {
    console.error("Funding failed:", e.message);
    process.exit(1);
  }
}
run();
