import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { utils } from "ethers";
import MerkleTree from 'merkletreejs';
import keccak256 from 'keccak256';
import { it } from "mocha";

describe("DAOtoken", function () {
  async function deploysDaotoken() {
    const [owner, otherAccount, add2] = await ethers.getSigners();

    const students = await ethers.getSigners();

    const leafNodes = students.map(student => keccak256(student.address));
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
  
    const rootHash = merkleTree.getHexRoot();

    const claimingAddress = students[0];

    const hexProof = merkleTree.getHexProof(keccak256(claimingAddress.address));

    const [add1] = await ethers.getSigners();

    console.log(add1.address);
    

    const DAOtoken = await ethers.getContractFactory("DAOtoken");
    const daotoken = await DAOtoken.deploy();

    return { owner, otherAccount, daotoken, students, add2, rootHash, hexProof};
  }

  /////////////////

  describe("DAOToken Contract Testing", function () {
    it("setting", async function () {
      const { daotoken ,rootHash} = await loadFixture(deploysDaotoken);
      await daotoken.setMerkleRoot(rootHash);
      await daotoken.setMintAmountPerPerson("10")       
      await daotoken.enableMinting(true)       
      expect (await daotoken.stateOfMinting()).to.equal(true)  
    });
    it("mint", async function () {
      const { daotoken ,rootHash, hexProof, students} = await loadFixture(deploysDaotoken);
      await daotoken.setMerkleRoot(rootHash);
      await daotoken.setMintAmountPerPerson("10")       
      await daotoken.enableMinting(true)       
      await daotoken.mint(hexProof);
      const balance = ethers.utils.parseEther("10")
      expect(await daotoken.balanceOf(students[0].address)).to.equal(balance);
    });
    // it("revert when minting is not allowed", async function () {
    //   const { daotoken ,rootHash, hexProof, students} = await loadFixture(deploysDaotoken);
    //   await daotoken.setMerkleRoot(rootHash);
    //   await daotoken.setMintAmountPerPerson("10")           
    //   expect (await daotoken.mint(hexProof)).to.revertedWith("session has not ended");
    // })
    it("mint and burn", async function () {
      const { daotoken ,rootHash, hexProof, students} = await loadFixture(deploysDaotoken);
      await daotoken.setMerkleRoot(rootHash);
      await daotoken.setMintAmountPerPerson("30")       
      await daotoken.enableMinting(true)       
      await daotoken.mint(hexProof);
      const balance = ethers.utils.parseEther("30")
      expect(await daotoken.balanceOf(students[0].address)).to.equal(balance);
      await daotoken.mint(hexProof);
      expect(await daotoken.balanceOf(students[0].address)).to.equal(balance);
    });
  });
});
