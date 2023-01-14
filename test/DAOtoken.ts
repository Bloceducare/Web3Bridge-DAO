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
    // Get Signers
    const [contractSigner, owner, otherAccount, add2, student1, student2, student3, student4, student5] = await ethers.getSigners();

    // Deploy the Diamond contract
    await deployDiamond();

    const AccessControl = await ethers.getContractAt("AccessControl", DiamondAddress);
    await AccessControl.connect(contractSigner).grantRole(7, owner.address);
    const HasRole =  await AccessControl.connect(contractSigner).hasRole(7, owner.address)
    console.log("Check to see if he truly has role", HasRole)

    // Get the MerkelProof
    const students = [student1, student2, student3, student4, student5]
    const leafNodes = students.map(student => keccak256(student.address));
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
    const rootHash = merkleTree.getHexRoot();
    const claimingAddress = students[0].address;
    const hexProof = merkleTree.getHexProof(keccak256(claimingAddress));


    // Deploy the DAO token
    const DAOtoken = await ethers.getContractFactory("DAOtoken");
    const daotoken = await DAOtoken.deploy();

    await daotoken.connect(owner).init(DiamondAddress)

    return { contractSigner, owner, otherAccount, daotoken, students, add2, rootHash, hexProof, student1, student2, student3, student4, student5}
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
      const { owner, daotoken ,rootHash, hexProof, student1} = await loadFixture(deploysDaotoken);
      await daotoken.connect(owner).setMerkleRoot(rootHash);
      await daotoken.connect(owner).setMintAmountPerPerson("10")
      await daotoken.connect(owner).enableMinting(true)
      await daotoken.connect(student1).mint(hexProof);
      const balance = ethers.utils.parseEther("10")
      expect(await daotoken.balanceOf(student1.address)).to.equal(balance);
    });

    it("mint and burn", async function () {
      const { owner, daotoken ,rootHash, hexProof, students, student1} = await loadFixture(deploysDaotoken);
      await daotoken.connect(owner).setMerkleRoot(rootHash);
      await daotoken.connect(owner).setMintAmountPerPerson("30")
      await daotoken.connect(owner).enableMinting(true)
      await daotoken.connect(student1).mint(hexProof);
      const balance = ethers.utils.parseEther("30")
      expect(await daotoken.balanceOf(student1.address)).to.equal(balance);
      await daotoken.connect(student1).mint(hexProof);
      expect(await daotoken.balanceOf(student1.address)).to.equal(balance);
    });

     it("testing transfer and transferfrom", async function () {
      const { owner, daotoken ,rootHash, hexProof, students, student1, student2 } = await loadFixture(deploysDaotoken);
      await daotoken.connect(owner).setMerkleRoot(rootHash);
      await daotoken.connect(owner).setMintAmountPerPerson("30")
      await daotoken.connect(owner).enableMinting(true)
      await daotoken.connect(student1).mint(hexProof);
      const balance = ethers.utils.parseEther("30")
      await daotoken.transfer(student2.address, balance)
      expect(await daotoken.balanceOf(student1.address)).to.equal(balance);
      expect(await daotoken.connect(student2).balanceOf(student2.address)).to.equal(0);
    });

  });
});