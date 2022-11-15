import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { utils } from "ethers";

import { it } from "mocha";

describe("Vault10", function () {
  async function deploysVaultAndToken() {
    const [owner, student1, student2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("VaultToken");
    const token = await Token.deploy("Tether", "USDT");

    const Vault10 = await ethers.getContractFactory("vault10");
    const vault10 = await Vault10.deploy(token.address, owner.address);

    return { owner, student1, student2, token, vault10 };
  }

  describe("Vault 10 Test", function () {
    it("Ensure the owner have deposited in vault contract", async function () {
      const { owner, student1, student2, token, vault10 } = await loadFixture(
        deploysVaultAndToken
      );
      const depositValue = ethers.utils.parseEther("20000");
      await token
        .connect(owner)
        .mint(owner.address, ethers.utils.parseEther("200000"));
      const balanceOfOwner = await token
        .connect(owner)
        .balanceOf(owner.address);
      console.log("Owner balance is", balanceOfOwner.toString());
      await token
        .connect(owner)
        .approve(vault10.address, ethers.utils.parseEther("100000000000"));
      await vault10.connect(owner).depositIntoVault(depositValue);
      expect(await vault10.returnVaultBalace()).to.equal(depositValue);
    });

    // Ensure that student cannot withdraw until the Vault is open
    it("Check if vault is open", async function () {
      const { owner, student1, student2, token, vault10 } = await loadFixture(
        deploysVaultAndToken
      );

      const depositValue = ethers.utils.parseEther("20000");
      await token.mint(owner.address, ethers.utils.parseEther("200000"));
      await token
        .connect(owner)
        .approve(vault10.address, ethers.utils.parseEther("100000000000"));
      await vault10.connect(owner).depositIntoVault(depositValue);
      await vault10.connect(owner).openVault();

      expect(await vault10.checkIfWithdrawTimeReached()).to.equal(true);
    });

    it("Ensure that student can withdraw just their share  ", async function () {
      const { owner, student1, student2, token, vault10 } = await loadFixture(
        deploysVaultAndToken
      );

      const depositValue = ethers.utils.parseEther("20000");
      await token.mint(owner.address, ethers.utils.parseEther("200000"));
      await token
        .connect(owner)
        .approve(vault10.address, ethers.utils.parseEther("100000000000"));
      await vault10.connect(owner).depositIntoVault(depositValue);
      await vault10.connect(owner).openVault();
      await vault10.connect(student1).addAddressOfEarlyPayment();
      await vault10.connect(student2).addAddressOfEarlyPayment();
      await vault10.connect(student2).withdrawShare();
      const student2bal = ethers.utils.parseEther("10000");
      const bal = await (await token.balanceOf(student2.address)).toString();
      console.log("this is the balance", bal);

      expect(await token.balanceOf(student2.address)).to.equal(student2bal);
    });
  });

  it("Test to ensure that only Owner can open vault", async function () {
    const { owner, student1, student2, token, vault10 } = await loadFixture(
      deploysVaultAndToken
    );

    await vault10.connect(owner).openVault();
    expect(await vault10.checkIfWithdrawTimeReached()).to.equal(true);
  });
});
