import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { utils } from "ethers";

import { it } from "mocha";

describe("DAOtoken", function () {

    async function deploysDaotoken() {

    const [owner, otherAccount, add2] = await ethers.getSigners();

    const Certificate = await ethers.getContractFactory("MockCertificate");
    const certificate = await Certificate.deploy();

    const DAOtoken = await ethers.getContractFactory("DAOtoken");
    const daotoken = await DAOtoken.deploy(certificate.address);

    return {owner, otherAccount,daotoken,certificate, add2};
  }
  
/////////////////

  describe("testing", function () {
    it("returns the amount to mint to each person", async function () {
      const {owner,otherAccount,daotoken,certificate} = await loadFixture(deploysDaotoken);
      await certificate.safeMint(otherAccount.address,"1");
      await daotoken.setMintAmountPerPerson("20");
      expect (await daotoken.getMintperPerson()).to.equal("20");
    })

    it("set minting to true and a seesion", async function () {
      const {owner,otherAccount,daotoken,certificate, add2} = await loadFixture(deploysDaotoken);
      await certificate.safeMint(otherAccount.address,"1");
      await daotoken.setMintAmountPerPerson("20");
      expect (await daotoken.getMintperPerson()).to.equal("20");
      await daotoken.setNewOwner(add2.address);
      // expect (await daotoken.enableMinting(true)).to.revertedWith("not owner");
      await daotoken.connect(add2).enableMinting(true);
    });

    it("set minting to true and a seesion", async function () {
      const {owner,otherAccount,daotoken,certificate, add2} = await loadFixture(deploysDaotoken);
      await certificate.safeMint(otherAccount.address,"1");
      await daotoken.setMintAmountPerPerson("20");
      expect (await daotoken.getMintperPerson()).to.equal("20");
      await daotoken.setNewOwner(add2.address);
      // expect (await daotoken.enableMinting(true)).to.revertedWith("not owner");
      await daotoken.connect(add2).enableMinting(true);
      // expect (await daotoken.mint()).to.revertedWith(" not a member ");
      await daotoken.connect(otherAccount).mint();
    })

    it("set minting to true and a seesion", async function () {
      const {owner,otherAccount,daotoken,certificate, add2} = await loadFixture(deploysDaotoken);
      await certificate.safeMint(otherAccount.address,"1");
      await daotoken.setMintAmountPerPerson("20");
      expect (await daotoken.getMintperPerson()).to.equal("20");
      await daotoken.setNewOwner(add2.address);
      // expect (await daotoken.enableMinting(true)).to.revertedWith("not owner");
      await daotoken.connect(add2).enableMinting(true);
      // expect (await daotoken.mint()).to.revertedWith(" not a member ");
      await daotoken.connect(otherAccount).mint();
      expect(await daotoken.balanceOf(otherAccount.address)).to.equal( ethers.utils.parseEther("20"))
    })
  });
})