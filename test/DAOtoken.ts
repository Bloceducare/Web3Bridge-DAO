import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { utils } from "ethers";
import MerkleTree from 'merkletreejs';
import keccak256 from 'keccak256';
import { it } from "mocha";
import { HasPaid__factory } from "../typechain-types";

describe("DAOtoken", function () {

    async function deploysDaotoken() {

    const [owner, otherAccount] = await ethers.getSigners();

    const [add1, add2, add3, add4] = await ethers.getSigners();
  
    const leafNodes = [add1, add2, add3, add4].map(signer => keccak256(signer.address));
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
  
    const rootHash = merkleTree.getHexRoot();

    const claimingAddress = add1;

    const hexProof = merkleTree.getHexProof(keccak256(claimingAddress.address));

    const HasPaid = await ethers.getContractFactory("HasPaid");
     // @ts-ignore
    const hasPaid = await HasPaid.deploy(owner.address);

    const Certificate = await ethers.getContractFactory("Certificate");
    const certificate = await Certificate.deploy(hasPaid.address);

    const DAOtoken = await ethers.getContractFactory("DAOtoken");
    const daotoken = await DAOtoken.deploy(certificate.address);

    return {owner, otherAccount, add1, add2, add3, add4, rootHash, hexProof, daotoken, certificate, hasPaid };
  }

  //this test is not completed : waiting for the nft certificate and its onlyowner than has be used to test , need to test with others

  describe("paid 1500 dollars , mint token and claim DAOtoken", function () {
    it("set State variables", async function () {
      const {owner,hasPaid, certificate} = await loadFixture(deploysDaotoken);
      // @ts-ignore
      await hasPaid.setStateVariables(owner.address, certificate.address);
      
    })
  });
})
