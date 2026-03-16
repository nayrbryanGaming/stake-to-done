const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("StakeToDonePure", function () {
    let stakeToDone;
    let owner;
    let user;
    let treasury;

    const STAKE_AMOUNT = ethers.parseEther("0.1");

    beforeEach(async function () {
        [owner, user, treasury] = await ethers.getSigners();

        const StakeToDonePure = await ethers.getContractFactory("StakeToDonePure");
        stakeToDone = await StakeToDonePure.deploy(treasury.address);
        await stakeToDone.waitForDeployment();
    });

    it("creates and stakes a task", async function () {
        const deadline = BigInt(await time.latest()) + 3600n;

        await expect(
            stakeToDone.connect(user).createAndStakeTask("Finish weekly report", deadline, {
                value: STAKE_AMOUNT,
            })
        )
            .to.emit(stakeToDone, "TaskCreated")
            .withArgs(1n, user.address, "Finish weekly report", deadline, STAKE_AMOUNT);

        const task = await stakeToDone.tasks(1);
        expect(task.user).to.equal(user.address);
        expect(task.description).to.equal("Finish weekly report");
        expect(task.stakeAmount).to.equal(STAKE_AMOUNT);
    });

    it("returns stake when task is completed before deadline", async function () {
        const deadline = BigInt(await time.latest()) + 3600n;

        await stakeToDone.connect(user).createAndStakeTask("Ship MVP", deadline, {
            value: STAKE_AMOUNT,
        });

        const beforeBalance = await ethers.provider.getBalance(user.address);
        const tx = await stakeToDone.connect(user).completeTask(1);

        await expect(tx)
            .to.emit(stakeToDone, "TaskCompleted")
            .withArgs(1n, user.address);

        const receipt = await tx.wait();
        const gasPrice = receipt.gasPrice ?? receipt.effectiveGasPrice ?? 0n;
        const gasCost = receipt.gasUsed * gasPrice;
        const afterBalance = await ethers.provider.getBalance(user.address);

        expect(afterBalance + gasCost).to.equal(beforeBalance + STAKE_AMOUNT);

        const task = await stakeToDone.tasks(1);
        expect(task.completed).to.equal(true);
        expect(task.claimed).to.equal(true);
    });

    it("sends expired stake to treasury", async function () {
        const deadline = BigInt(await time.latest()) + 3600n;

        await stakeToDone.connect(user).createAndStakeTask("Submit thesis", deadline, {
            value: STAKE_AMOUNT,
        });

        await time.increaseTo(Number(deadline) + 1);

        const treasuryBefore = await ethers.provider.getBalance(treasury.address);

        await expect(stakeToDone.claimExpiredTask(1))
            .to.emit(stakeToDone, "TaskFailed")
            .withArgs(1n, user.address, STAKE_AMOUNT);

        const treasuryAfter = await ethers.provider.getBalance(treasury.address);
        expect(treasuryAfter).to.equal(treasuryBefore + STAKE_AMOUNT);

        const task = await stakeToDone.tasks(1);
        expect(task.claimed).to.equal(true);
        expect(task.completed).to.equal(false);
    });

    it("rejects completion after deadline", async function () {
        const deadline = BigInt(await time.latest()) + 3600n;

        await stakeToDone.connect(user).createAndStakeTask("Late task", deadline, {
            value: STAKE_AMOUNT,
        });

        await time.increaseTo(Number(deadline) + 1);

        await expect(
            stakeToDone.connect(user).completeTask(1)
        ).to.be.revertedWithCustomError(stakeToDone, "DeadlinePassed");
    });
});
