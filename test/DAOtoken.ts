import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { utils } from "ethers";
import MerkleTree from 'merkletreejs';
import keccak256 from 'keccak256';
import { it } from "mocha";
import {deployDiamond, DiamondAddress} from "../scripts/deploy"

describe("DAOtoken", function () {
  async function deploysDaotoken() {
    const [contractSigner, owner, otherAccount, add2, student1, student2, student3, student4, student5] = await ethers.getSigners();

    await deployDiamond();

    const AccessControl = await ethers.getContractAt("AccessControl", DiamondAddress);
    await AccessControl.connect(contractSigner).grantRole(7, owner.address);
    const HasRole =  await AccessControl.connect(contractSigner).hasRole(7, owner.address)
    console.log("Check to see if he truly has role", HasRole)

    const students = [student1, student2, student3, student4, student5]
    const leafNodes = students.map(student => keccak256(student.address));
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
    const rootHash = merkleTree.getHexRoot();
    const claimingAddress = students[0].address;
    const hexProof = merkleTree.getHexProof(keccak256(claimingAddress));


    const DAOtoken = await ethers.getContractFactory("DAOtoken");
    const daotoken = await DAOtoken.deploy();

    await daotoken.connect(owner).init(DiamondAddress)

    return { contractSigner, owner, otherAccount, daotoken, students, add2, rootHash, hexProof}
  }

  /////////////////

  describe("DAOToken Contract Testing", function () {
    it("setting", async function () {
      const { contractSigner, owner, daotoken ,rootHash} = await loadFixture(deploysDaotoken);
      await daotoken.connect(owner).setMerkleRoot(rootHash);
      await daotoken.connect(owner).setMintAmountPerPerson("10");
      await daotoken.connect(owner).enableMinting(true)
      expect (await daotoken.stateOfMinting()).to.equal(true)
    });
    it("mint", async function () {
      const { owner, daotoken ,rootHash, hexProof} = await loadFixture(deploysDaotoken);
      await daotoken.connect(owner).setMerkleRoot(rootHash);
      await daotoken.connect(owner).setMintAmountPerPerson("10")
      await daotoken.connect(owner).enableMinting(true)
      await daotoken.mint(hexProof);
    //   const balance = ethers.utils.parseEther("10")
    //   expect(await daotoken.balanceOf(students[0].address)).to.equal(balance);
    });
    // it("revert when minting is not allowed", async function () {
    //   const { daotoken ,rootHash, hexProof, students} = await loadFixture(deploysDaotoken);
    //   await daotoken.setMerkleRoot(rootHash);
    //   await daotoken.setMintAmountPerPerson("10")
    //   expect (await daotoken.mint(hexProof)).to.revertedWith("session has not ended");
    // })
    // it("mint and burn", async function () {
    //   const { daotoken ,rootHash, hexProof, students} = await loadFixture(deploysDaotoken);
    //   await daotoken.setMerkleRoot(rootHash);
    //   await daotoken.setMintAmountPerPerson("30")
    //   await daotoken.enableMinting(true)
    //   await daotoken.mint(hexProof);
    //   const balance = ethers.utils.parseEther("30")
    //   expect(await daotoken.balanceOf(students[0].address)).to.equal(balance);
    //   await daotoken.mint(hexProof);
    //   expect(await daotoken.balanceOf(students[0].address)).to.equal(balance);
    // });
    //  it("testing transfer and transferfrom", async function () {
    //   const { daotoken ,rootHash, hexProof, students} = await loadFixture(deploysDaotoken);
    //   await daotoken.setMerkleRoot(rootHash);
    //   await daotoken.setMintAmountPerPerson("30")
    //   await daotoken.enableMinting(true)
    //   await daotoken.mint(hexProof);
    //   const balance = ethers.utils.parseEther("30")
    //   await daotoken.transfer(students[1].address, balance)
    //   expect(await daotoken.balanceOf(students[0].address)).to.equal(balance);
    //   expect(await daotoken.connect(students[1]).balanceOf(students[1].address)).to.equal(0);
    // })
  });
});