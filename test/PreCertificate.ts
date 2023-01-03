// @ts-nocheck
import { ContractReceipt, Transaction } from "ethers";
import { TransactionDescription, TransactionTypes } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { DiamondCutFacet } from "../typechain-types";
import { getSelectors, FacetCutAction } from "../scripts/libraries/diamond";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { assert, expect } from "chai";
import { utils } from "ethers";
import {deployDiamond, DiamondAddress, preCertificateToken} from "../scripts/deploy"

import { it } from "mocha";
import { stringify } from "querystring";

const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");
const helpers = require("@nomicfoundation/hardhat-network-helpers");



describe("PreCertificateToken", function () {
  async function deploysPreCertificateToken() {
    const accounts = await ethers.getSigners();
    const contractOwner = accounts[0];
    const [owner, address1, address2, address3, address4, address5, address6, address7, address8, ] = await ethers.getSigners();

    await deployDiamond();

    const diamond = await ethers.getContractAt(
      "PreCertificateToken",
      DiamondAddress
    );
    
    //deploying erc20 contract
    const Token = await ethers.getContractFactory("VaultToken");
    const token = await Token.deploy("Tether", "USDT");
    
    //deploying Vault5 contract
    const Vault5 = await ethers.getContractFactory("Vault5");
    const vault5 = await Vault5.deploy(token.address, owner.address);

    //deploying Vault10 contract
    
    const Vault10 = await ethers.getContractFactory("Vault10");
    const vault10 = await Vault10.deploy(token.address, owner.address);


    // deploying Certificate contract
    const Certificate = await ethers.getContractFactory("MockCertificate");
    const certificate = await Certificate.deploy();

    // deploying DAO token contract
    const DAOtoken = await ethers.getContractFactory("DAOtoken");
    const daotoken = await DAOtoken.deploy();



    

   // merkle tree

   let whitelistAddresses = [address1.address, address2.address, address3.address, address4.address, address5.address, address6.address, address7.address, address8.address]
   const encodeLeaf = whitelistAddresses.map(addr => keccak256(addr));
   const merkleTree = new MerkleTree(encodeLeaf, keccak256, {sortPairs: true});

   const rootHash = merkleTree.getHexRoot();

   return { whitelistAddresses, owner,address1,address2,rootHash, token,merkleTree, preCertificateToken, diamond };
  }




  describe("Testing the PreCertificateToken functions", function () {
    it("checks PreCertificateToken contract is deployed successfully", async function () {
        const { preCertificateToken } = await loadFixture(deploysPreCertificateToken);
        assert.ok(preCertificateToken.address);
      });

    it("checks PrecertificateToken contract balance is zero", async function () {
      const { owner,address1, token, preCertificateToken } = await loadFixture(deploysPreCertificateToken);

      await token.mint(address1.address, ethers.utils.parseEther("200000"));

      const balanceOfAddressOne = await token
      .connect(address1)
      .balanceOf(address1.address);

     const balanceOfPreCerticateToken = await token.balanceOf(preCertificateToken.address);
    
     expect(balanceOfPreCerticateToken).to.equal(0);
    });
    it("checks that PreCertificateToken balance is equal to the amount paid", async function () {
        const { owner,address1,rootHash, token, preCertificateToken, merkleTree } = await loadFixture(deploysPreCertificateToken);
  
        await token.mint(address1.address, ethers.utils.parseEther("200000"));
      
  
        const amount = ethers.utils.parseEther("10");
        const schoolFees = ethers.utils.parseEther("20");
  
        const leaf = keccak256(address1.address);
        const proof = merkleTree.getHexProof(leaf);
  
       const setAmount = await preCertificateToken.connect(owner).setFee(schoolFees,rootHash,token.address,6,9);
  
       await token
       .connect(address1)
       .approve(preCertificateToken.address, amount);
  
       const studentPayment = await preCertificateToken.connect(address1).payFee(amount,proof);
  
       const addressBalance = await token.balanceOf(address1.address);
       console.log("Address one balance 2 is", addressBalance.toString());
       
       const contractBalance = await token.balanceOf(preCertificateToken.address);
       console.log("Address contract balance is", contractBalance.toString());
  
       expect(contractBalance).to.equal(amount);
      });
      it("checks that the student have completed their payment", async function () {
        const { owner,address1,rootHash, token, preCertificateToken,merkleTree } = await loadFixture(deploysPreCertificateToken);
  
        await token.mint(address1.address, ethers.utils.parseEther("200000"));
      
  
        const amount = ethers.utils.parseEther("20");
        const schoolFees = ethers.utils.parseEther("20");
  
        const leaf = keccak256(address1.address);
        const proof = merkleTree.getHexProof(leaf);
  
       const setAmount = await preCertificateToken.connect(owner).setFee(schoolFees,rootHash,token.address,6,9);
  
       await token
       .connect(address1)
       .approve(preCertificateToken.address, amount);
  
       const studentPayment = await preCertificateToken.connect(address1).payFee(amount,proof);
  
       const addressBalance = await token.balanceOf(address1.address);
       
       const contractBalance = await token.balanceOf(preCertificateToken.address);

       const checkComplete = await preCertificateToken.checkCompleted(
        address1.address
      );
  
       expect(checkComplete).to.equal(true);
      });
      it("checks that students can claim their Tokens", async function () {
        const { whitelistAddresses,address1,owner,rootHash, token, preCertificateToken,merkleTree } = await loadFixture(deploysPreCertificateToken);

        await token.mint(address1.address, ethers.utils.parseEther("200000"));
      
  
        const amount = ethers.utils.parseEther("20");
        const schoolFees = ethers.utils.parseEther("20");

        const addressBalance = await token.balanceOf(address1.address);
        
        const contractBalance = await token.balanceOf(preCertificateToken.address);

        const encodeLeaf = whitelistAddresses.map(addr => keccak256(addr));
        
        const leaf = keccak256(address1.address);
        const proof = merkleTree.getHexProof(leaf);
  
       const setAmount = await preCertificateToken.connect(owner).setFee(schoolFees,rootHash,token.address,6,9);
  
       await token
       .connect(address1)
       .approve(preCertificateToken.address, amount);
  
       const studentPayment = await preCertificateToken.connect(address1).payFee(amount,proof);
        
       const claimToken = await preCertificateToken.connect(address1).claimToken(
        proof
      );
      const cohortStudent = await preCertificateToken.studentDetails(address1.address);

      expect(cohortStudent.claimed).to.equal(true);
  
      });
  });
});
