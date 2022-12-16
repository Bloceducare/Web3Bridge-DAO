import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { utils } from "ethers";

import { it } from "mocha";

describe("TipsToken", function () {
  async function deploysTipsToken() {
    const [owner, student1, student2] = await ethers.getSigners();

    const Tipstoken = await ethers.getContractFactory("TipsToken");
    const tipstoken = await Tipstoken.deploy("TipsToken", "TSP", owner.address);

    return { owner, student1, student2, tipstoken};
  }


  
  describe("Test for tips token ", function () {
    it("Ensure that only owner can change the root hash", async function () {
      const {  owner, student1, student2,  tipstoken} = await loadFixture(
        deploysTipsToken
      );
      const rootHash = "0x9777e89e600260a4d95bfdb0d483539037fef5ab5e7abc68fe4b5844a3d6551b"
      await tipstoken.connect(owner).changeHashRoot(rootHash)
      expect(await tipstoken.returnMerkelRoot()).to.equal(rootHash);
    });

    it("Ensure that the number set is number oftokens to be minted", async function () {
        const {  owner, student1, student2,  tipstoken} = await loadFixture(
          deploysTipsToken
        );
       
        const numTokens = await ethers.utils.parseEther("100")
        await tipstoken.connect(owner).setNumberOfTokensToMint(numTokens)
        expect(await tipstoken.returnNumOftoken()).to.equal(numTokens);
      });
  

});



});
