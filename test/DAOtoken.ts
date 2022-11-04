import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { utils } from "ethers";

describe("DAOtoken", function () {

  async function deploysDaotoken() {

    const [owner, otherAccount, add3] = await ethers.getSigners();

    const Nfttoken = await ethers.getContractFactory("faketoken");
    const nfttoken = await Nfttoken.deploy();

    const DAOtoken = await ethers.getContractFactory("DAOtoken");
    const daotoken = await DAOtoken.deploy(nfttoken.address);

    return {owner, otherAccount, add3, daotoken, nfttoken};
  }

  //this test is not completed : waiting for the nft certificate and its onlyowner than has be used to test , need to test with others

  describe("Mint tokens to members", function () {
    it("Should Mint tokens when ........", async function () {
        const {owner,  daotoken, nfttoken} = await loadFixture(deploysDaotoken);
        let amount1 = ethers.utils.parseEther("1");
        await nfttoken.mint(amount1)
        let amount = ethers.utils.parseEther("20");
        await daotoken.setMintAmountPerPerson(20);
        await daotoken.enableMinting(true);
        await daotoken.mint();
        expect(await daotoken.balanceOf(owner.address)).to.equal(amount);
    });

    it("revert when minting is off", async function () {
      const {daotoken, nfttoken} = await loadFixture(deploysDaotoken);
      let amount1 = ethers.utils.parseEther("1");
      await nfttoken.mint(amount1)
      let amount = ethers.utils.parseEther("20");
      await daotoken.setMintAmountPerPerson(20);
     // await daotoken.enableMinting(true);
      await expect (daotoken.mint()).to.revertedWith("session has not ended");
  });
    
  });
});
