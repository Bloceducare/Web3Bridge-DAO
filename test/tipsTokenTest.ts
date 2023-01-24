import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { utils } from "ethers";
import {deployDiamond, DiamondAddress} from "../scripts/deploy"

import { it } from "mocha";

describe("TipsToken", function () {
  async function deploysTipsToken() {
    const [contractSigner,owner, student1, student2] = await ethers.getSigners();

    await deployDiamond();

    const AccessControl = await ethers.getContractAt("AccessControl", DiamondAddress);
    await AccessControl.connect(contractSigner).grantRole(4, owner.address);
    const HasRole =  await AccessControl.connect(contractSigner).hasRole(4, owner.address)
    console.log("Check to see if he truly has role", HasRole)

    const Tipstoken = await ethers.getContractFactory("TipsToken");
    const tipstoken = await Tipstoken.deploy("TipsToken", "TSP", DiamondAddress);

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
