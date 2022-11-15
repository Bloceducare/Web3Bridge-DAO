import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { utils } from "ethers";
import MerkleTree from 'merkletreejs';
import keccak256 from 'keccak256';

import { it } from "mocha";

describe("TipToken", function () {

    async function deploysTipToken() {

    const [owner, otherAccount, add2] = await ethers.getSigners();
    
    const students = [
        "0xe5cd92f88c2e6659de23944985eba50628318c9b",
        "0x626e3Fa07728FEf9b1FC3306866A906b51034d22",
        "0x02f84a56e4ebba0f7840aab2664ad1c8476b5ed5",
        "0xD909b78898AE965C90bb57056da4B18a00582d0E"
      ]
  
      // const signers = await ethers.getSigners();
    
      const leafNodes = students.map(students => keccak256 (students));
      const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
    
      const rootHash = merkleTree.getHexRoot();
      const claimingAddress = students[0];

    const hexProof = merkleTree.getHexProof(keccak256(claimingAddress));
    
    const TipToken = await ethers.getContractFactory("TipToken");
    const tiptoken = await TipToken.deploy("TokenName","TokenSymbol", owner.address);


    return {owner, otherAccount,rootHash,hexProof,tiptoken, add2};
  }
  
/////////////////

  describe("testing", function () {
    it("returns the amount to mint to each person", async function () {
      const {owner, otherAccount,rootHash,hexProof,tiptoken, add2} = await loadFixture(deploysTipToken);
      await tiptoken.changeHashRoot(rootHash)
    })
  })
})