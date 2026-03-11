const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("StakeToDone", function () {
    let stakeToDone;
    let mockUSDC;
    let owner, user, treasury;
    const STAKE_AMOUNT = ethers.parseUnits("10", 6); // 10 USDC

    beforeEach(async function () {
        [owner, user, treasury] = await ethers.getSigners();

        const MockUSDC = await ethers.getContractFactory("MockUSDC");
        mockUSDC = await MockUSDC.deploy();

        const StakeToDone = await ethers.getContractFactory("StakeToDone");
        stakeToDone = await StakeToDone.deploy(await mockUSDC.getAddress(), treasury.address);

        // Give user some tokens and approve contract
        await mockUSDC.transfer(user.address, STAKE_AMOUNT * BigInt(2));
        await mockUSDC.connect(user).approve(await stakeToDone.getAddress(), STAKE_AMOUNT * BigInt(2));
    });

    it("Should create a task", async function () {
        const latestTime = await time.latest();
        const deadline = BigInt(latestTime) + BigInt(3600);
        await expect(stakeToDone.connect(user).createTask("Finish the MVP", deadline))
            .to.emit(stakeToDone, "TaskCreated")
            .withArgs(BigInt(1), user.address, "Finish the MVP", deadline);

        const task = await stakeToDone.tasks(1);
        expect(task.description).to.equal("Finish the MVP");
        expect(task.user).to.equal(user.address);
    });

    it("Should stake tokens for a task", async function () {
        const latestTime = await time.latest();
        const deadline = BigInt(latestTime) + BigInt(3600);
        await stakeToDone.connect(user).createTask("Finish the MVP", deadline);

        await expect(stakeToDone.connect(user).stakeTask(1, STAKE_AMOUNT))
            .to.emit(stakeToDone, "TaskStaked")
            .withArgs(BigInt(1), user.address, STAKE_AMOUNT);

        const task = await stakeToDone.tasks(1);
        expect(task.stakeAmount).to.equal(STAKE_AMOUNT);
        expect(await mockUSDC.balanceOf(await stakeToDone.getAddress())).to.equal(STAKE_AMOUNT);
    });

    it("Should return funds when task completed before deadline", async function () {
        const latestTime = await time.latest();
        const deadline = BigInt(latestTime) + BigInt(3600);
        await stakeToDone.connect(user).createTask("Finish the MVP", deadline);
        await stakeToDone.connect(user).stakeTask(1, STAKE_AMOUNT);

        const initialBalance = await mockUSDC.balanceOf(user.address);

        await expect(stakeToDone.connect(user).completeTask(1))
            .to.emit(stakeToDone, "TaskCompleted")
            .withArgs(BigInt(1), user.address);

        const task = await stakeToDone.tasks(1);
        expect(task.completed).to.be.true;
        expect(await mockUSDC.balanceOf(user.address)).to.equal(initialBalance + STAKE_AMOUNT);
    });

    it("Should send funds to treasury when deadline passed", async function () {
        const latestTime = await time.latest();
        const deadline = BigInt(latestTime) + BigInt(3600);
        await stakeToDone.connect(user).createTask("Finish the MVP", deadline);
        await stakeToDone.connect(user).stakeTask(1, STAKE_AMOUNT);

        // Advance time past deadline
        await time.increaseTo(Number(deadline) + 1);

        const initialTreasuryBalance = await mockUSDC.balanceOf(treasury.address);

        await expect(stakeToDone.claimExpiredTask(1))
            .to.emit(stakeToDone, "TaskFailed")
            .withArgs(BigInt(1), user.address, STAKE_AMOUNT);

        const task = await stakeToDone.tasks(1);
        expect(task.claimed).to.be.true;
        expect(await mockUSDC.balanceOf(treasury.address)).to.equal(initialTreasuryBalance + STAKE_AMOUNT);
    });

    it("Should create and stake in one transaction", async function () {
        const latestTime = await time.latest();
        const deadline = BigInt(latestTime) + BigInt(3600);
        
        await expect(stakeToDone.connect(user).createAndStakeTask("Finish the MVP", deadline, STAKE_AMOUNT))
            .to.emit(stakeToDone, "TaskCreated")
            .withArgs(BigInt(1), user.address, "Finish the MVP", deadline)
            .to.emit(stakeToDone, "TaskStaked")
            .withArgs(BigInt(1), user.address, STAKE_AMOUNT);

        const task = await stakeToDone.tasks(1);
        expect(task.description).to.equal("Finish the MVP");
        expect(task.stakeAmount).to.equal(STAKE_AMOUNT);
        expect(await mockUSDC.balanceOf(await stakeToDone.getAddress())).to.equal(STAKE_AMOUNT);
    });
});
