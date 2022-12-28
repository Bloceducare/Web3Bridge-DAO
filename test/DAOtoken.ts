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

    const PreCertificateToken = await ethers.getContractFactory("PreCertificateToken");
    const preCertificateToken = await PreCertificateToken.deploy(
      "0x414F7137BF842F29cA0f77bF7007F788692F0766", "0x23d5C0bAdf63ff6422B5B9310211d9BcE147e720",
      "0xBaF6dC2E647aeb6F510f9e318856A1BCd66C5e19", "0xd4E96eF8eee8678dBFf4d535E033Ed1a4F7605b7",
    );

    const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
    const diamondCutFacet = await DiamondCutFacet.deploy();

    const Diamond = await ethers.getContractFactory("Diamond");
    const diamond = await Diamond.deploy("0x23d5C0bAdf63ff6422B5B9310211d9BcE147e720",
    preCertificateToken.address, diamondCutFacet.address, daotoken.address
    );

    return { owner, otherAccount, daotoken, students, add2, rootHash, hexProof,
        diamond, preCertificateToken, diamondCutFacet,
    };
  }

  /////////////////

  describe("DAOToken Contract Testing", function () {
    it("setting", async function () {
      const { daotoken ,rootHash, diamond} = await loadFixture(deploysDaotoken)
      await daotoken.init(diamond.address)
      await daotoken.setMerkleRoot(rootHash);
      await daotoken.setMintAmountPerPerson("10")
      await daotoken.enableMinting(true)
      expect (await daotoken.stateOfMinting()).to.equal(true)
    });
    it("mint", async function () {
      const { daotoken ,rootHash, hexProof, students, diamond} = await loadFixture(deploysDaotoken);
      await daotoken.init(diamond.address)
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
      const { daotoken ,rootHash, hexProof, students, diamond} = await loadFixture(deploysDaotoken);
      await daotoken.init(diamond.address)
      await daotoken.setMerkleRoot(rootHash);
      await daotoken.setMintAmountPerPerson("30")
      await daotoken.enableMinting(true)
      await daotoken.mint(hexProof);
      const balance = ethers.utils.parseEther("30")
      expect(await daotoken.balanceOf(students[0].address)).to.equal(balance);
      await daotoken.mint(hexProof);
      expect(await daotoken.balanceOf(students[0].address)).to.equal(balance);
    });
     it("testing transfer and transferfrom", async function () {
      const { daotoken ,rootHash, hexProof, students, diamond} = await loadFixture(deploysDaotoken);
      await daotoken.init(diamond.address)
      await daotoken.setMerkleRoot(rootHash);
      await daotoken.setMintAmountPerPerson("30")
      await daotoken.enableMinting(true)
      await daotoken.mint(hexProof);
      const balance = ethers.utils.parseEther("30")
      await daotoken.transfer(students[1].address, balance)
      expect(await daotoken.balanceOf(students[0].address)).to.equal(balance);
      expect(await daotoken.connect(students[1]).balanceOf(students[1].address)).to.equal(0);
    })
  });
});