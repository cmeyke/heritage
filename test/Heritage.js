const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const passTime = (time) => ethers.provider.send('evm_increaseTime', [time]);
const oneYear = 365 * 24 * 60 * 60;
const initialEtherBalance = "100";
const initialWeiBalance = ethers.utils.parseEther(initialEtherBalance);
const oneEther = ethers.utils.parseEther("1");
const initialTokenBalance = 10000;

describe("Heritage", function () {
  async function deployHeritageFixture() {
    const [appointer, heir] = await ethers.getSigners();

    const Heritage = await ethers.getContractFactory("Heritage");
    const heritage = await Heritage.deploy(heir.address, oneYear, { value: initialWeiBalance });

    const APPOINTER_ROLE = await heritage.APPOINTER_ROLE();
    const HEIR_ROLE = await heritage.HEIR_ROLE();
    const DEFAULT_ADMIN_ROLE = await heritage.DEFAULT_ADMIN_ROLE();

    const TestToken = await ethers.getContractFactory("TestToken");
    const token = await TestToken.deploy(initialTokenBalance);
    await token.deployed();
    await token.transfer(heritage.address, initialTokenBalance);

    return { heritage, appointer, heir, APPOINTER_ROLE, HEIR_ROLE, DEFAULT_ADMIN_ROLE, token };
  }

  describe("Deployment", function () {
    it("Should set the right roles", async function () {
      const { heritage, appointer, heir, APPOINTER_ROLE, HEIR_ROLE, DEFAULT_ADMIN_ROLE } =
        await loadFixture(deployHeritageFixture);

      expect(await heritage.hasRole(APPOINTER_ROLE, appointer.address)).to.equal(true);
      expect(await heritage.hasRole(HEIR_ROLE, appointer.address)).to.equal(false);
      expect(await heritage.hasRole(DEFAULT_ADMIN_ROLE, appointer.address)).to.equal(true);

      expect(await heritage.hasRole(HEIR_ROLE, heir.address)).to.equal(true);
      expect(await heritage.hasRole(APPOINTER_ROLE, heir.address)).to.equal(false);
      expect(await heritage.hasRole(DEFAULT_ADMIN_ROLE, heir.address)).to.equal(false);
    });

    it(`Should have ${initialEtherBalance} Ether`, async function () {
      const { heritage } = await loadFixture(deployHeritageFixture);

      expect(await ethers.provider.getBalance(heritage.address)).to.equal(initialWeiBalance);
    });
  });

  describe("Accept Inheritance", function () {
    it("Should not allow inheritance acceptance before the defined time of inactivty has passed", async function () {
      const { heritage, appointer, heir, APPOINTER_ROLE, HEIR_ROLE, DEFAULT_ADMIN_ROLE } =
        await loadFixture(deployHeritageFixture);

      await expect(heritage.connect(heir).acceptInheritance(false)).to.be.rejected;
      await passTime(oneYear+1);
      await expect(heritage.connect(heir).acceptInheritance(false)).to.not.be.rejected;
    });

    it("Should only allow the heir to accept the inheritance", async function () {
      const { heritage, appointer, heir, APPOINTER_ROLE, HEIR_ROLE, DEFAULT_ADMIN_ROLE } =
        await loadFixture(deployHeritageFixture);

      await passTime(oneYear+1);
      await expect(heritage.acceptInheritance(false)).to.be.rejected;
      await expect(heritage.connect(heir).acceptInheritance(false)).to.not.be.rejected;
    });

    it("Should set the right roles after inheritance acceptance", async function () {
      const { heritage, appointer, heir, APPOINTER_ROLE, HEIR_ROLE, DEFAULT_ADMIN_ROLE } =
        await loadFixture(deployHeritageFixture);

      await passTime(oneYear+1);
      await heritage.connect(heir).acceptInheritance(true);
      expect(await heritage.hasRole(APPOINTER_ROLE, appointer.address)).to.equal(false);
      expect(await heritage.hasRole(HEIR_ROLE, heir.address)).to.equal(false);
      expect(await heritage.hasRole(APPOINTER_ROLE, heir.address)).to.equal(true);
      expect(await heritage.hasRole(DEFAULT_ADMIN_ROLE, heir.address)).to.equal(true);
    });
  });

  describe("Transfer ether", function () {
    it("Should store ether", async function () {
      const { heritage, appointer, heir, APPOINTER_ROLE, HEIR_ROLE, DEFAULT_ADMIN_ROLE } =
        await loadFixture(deployHeritageFixture);

      await appointer.sendTransaction({ to: heritage.address, value: oneEther });
      const balance = await ethers.provider.getBalance(heritage.address);
      expect(balance).to.equal(initialWeiBalance.add(oneEther));
    });

    it("Appointer should be able to transfer ether", async function () {
      const { heritage, appointer, heir, APPOINTER_ROLE, HEIR_ROLE, DEFAULT_ADMIN_ROLE } =
        await loadFixture(deployHeritageFixture);

      const initialBalance = await ethers.provider.getBalance(heir.address);
      await heritage.executeTransaction(heir.address, oneEther, "0x");
      const balance = await ethers.provider.getBalance(heir.address);
      expect(balance).to.equal(initialBalance.add(oneEther));
    });

    it("Only appointer should be able to transfer ether", async function () {
      const { heritage, appointer, heir, APPOINTER_ROLE, HEIR_ROLE, DEFAULT_ADMIN_ROLE } =
        await loadFixture(deployHeritageFixture);

      await expect(heritage.connect(heir).executeTransaction(heir.address, oneEther, "0x")).to.be.rejected;
      await expect(heritage.executeTransaction(heir.address, oneEther, "0x")).to.not.be.rejected;
    });
  });

  describe("Transfer ERC20 tokens", function () {
    it("Should store ERC20 tokens", async function() {
      const { heritage, appointer, heir, APPOINTER_ROLE, HEIR_ROLE, DEFAULT_ADMIN_ROLE, token } =
        await loadFixture(deployHeritageFixture);

      const balance = await token.balanceOf(heritage.address);
      expect(balance.toNumber()).to.equal(initialTokenBalance);
    });

    it("Appointer should be able to transfer ERC20 tokens", async function () {
      const { heritage, appointer, heir, APPOINTER_ROLE, HEIR_ROLE, DEFAULT_ADMIN_ROLE, token } =
        await loadFixture(deployHeritageFixture);
      
      const data = token.interface.encodeFunctionData("transfer", [heir.address, initialTokenBalance]);
      await heritage.executeTransaction(token.address, 0, data);
      expect((await token.balanceOf(heritage.address)).toNumber()).to.equal(0);
      expect((await token.balanceOf(heir.address)).toNumber()).to.equal(initialTokenBalance);
    });


    it("Only appointer should be able to transfer ERC20 tokens", async function () {
      const { heritage, appointer, heir, APPOINTER_ROLE, HEIR_ROLE, DEFAULT_ADMIN_ROLE, token } =
        await loadFixture(deployHeritageFixture);

      const data = token.interface.encodeFunctionData("transfer", [heir.address, initialTokenBalance]);
      await expect(heritage.connect(heir).executeTransaction(token.address, 0, data)).to.be.rejected;
      await expect(heritage.executeTransaction(token.address, 0, data)).to.not.be.rejected;
    });
  });
});
