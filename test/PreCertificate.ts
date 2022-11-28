import { ContractReceipt, Transaction } from "ethers";
import { TransactionDescription, TransactionTypes } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { DiamondCutFacet } from "../typechain-types";
import { getSelectors, FacetCutAction } from "../scripts/libraries/diamond";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { assert, expect } from "chai";
import { utils } from "ethers";

import { it } from "mocha";
import { stringify } from "querystring";

const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");
const helpers = require("@nomicfoundation/hardhat-network-helpers");


export let DiamondAddress: string;

describe("PreCertificateToken", function () {
async function deploysPreCertificateToken() {
  const accounts = await ethers.getSigners();
  const contractOwner = accounts[0];
  const [owner, address1, address2, address3, address4, address5, address6, address7, address8, ] = await ethers.getSigners();

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

  // deploy DiamondCutFacet
  const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
  const diamondCutFacet = await DiamondCutFacet.deploy();
  await diamondCutFacet.deployed();
  console.log("DiamondCutFacet deployed:", diamondCutFacet.address);

  // deploy Diamond and pass the DAO token address one of the arguments
  const Diamond = await ethers.getContractFactory("Diamond");
  const diamond = await Diamond.deploy(
    contractOwner.address,
    diamondCutFacet.address,
    daotoken.address,
    daotoken.address
  );
  await diamond.deployed();
  console.log("Diamond deployed:", diamond.address);

  // deploy DiamondInit
  // DiamondInit provides a function that is called when the diamond is upgraded to initialize state variables
  // Read about how the diamondCut function works here: https://eips.ethereum.org/EIPS/eip-2535#addingreplacingremoving-functions
  const DiamondInit = await ethers.getContractFactory("DiamondInit");
  const diamondInit = await DiamondInit.deploy();
  await diamondInit.deployed();
  console.log("DiamondInit deployed:", diamondInit.address);

  // deploy facets
  console.log("");
  console.log("Deploying facets");
  const FacetNames = [
    "DiamondLoupeFacet",
    "OwnershipFacet",
    "GovernanceFacet",
  ];
  const cut = [];
  for (const FacetName of FacetNames) {
    const Facet = await ethers.getContractFactory(FacetName);
    const facet = await Facet.deploy();
    await facet.deployed();
    console.log(`${FacetName} deployed: ${facet.address}`);
    cut.push({
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facet),
    });
  }

  // upgrade diamond with facets
  console.log("");
  console.log("Diamond Cut:", cut);
  const diamondCut = (await ethers.getContractAt(
    "IDiamondCut",
    diamond.address
  )) as DiamondCutFacet;

  let tx;
  let receipt: ContractReceipt;
  // call to init function
  let functionCall = diamondInit.interface.encodeFunctionData("init");
  tx = await diamondCut.diamondCut(cut, diamondInit.address, functionCall);
  console.log("Diamond cut tx: ", tx.hash);
  receipt = await tx.wait();
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`);
  }
  console.log("Completed diamond cut");
  DiamondAddress = diamond.address;

  const PrCertificate = await ethers.getContractFactory("PreCertificateToken");
  const precertificate = await PrCertificate.deploy(owner.address,vault10.address,vault5.address,token.address);

  console.log("PreCertificateToken Deployed Here:", precertificate.address);



  // merkle tree

  let whitelistAddresses = [address1.address, address2.address, address3.address, address4.address, address5.address, address6.address, address7.address, address8.address]
  const encodeLeaf = whitelistAddresses.map(addr => keccak256(addr));
  const merkleTree = new MerkleTree(encodeLeaf, keccak256, {sortPairs: true});

  const rootHash = merkleTree.getHexRoot();

  return { whitelistAddresses, owner,address1,address2,rootHash, token, precertificate,merkleTree,diamond };
}




describe("Testing the PreCertificateToken functions", function () {
  it("checks PreCertificateToken contract is deployed successfully", async function () {
      const { precertificate } = await loadFixture(deploysPreCertificateToken);
      assert.ok(precertificate.address);
    });

  it("checks PrecertificateToken contract balance is zero", async function () {
    const { owner,address1, token, precertificate } = await loadFixture(deploysPreCertificateToken);

    await token.mint(address1.address, ethers.utils.parseEther("200000"));

    const balanceOfAddressOne = await token
    .connect(address1)
    .balanceOf(address1.address);

    const balanceOfPreCerticateToken = await token.balanceOf(precertificate.address);
  
    expect(balanceOfPreCerticateToken).to.equal(0);
  });
  it("checks that PreCertificateToken balance is equal to the amount paid", async function () {
      const { owner,address1,rootHash, token, precertificate,merkleTree } = await loadFixture(deploysPreCertificateToken);

      await token.mint(address1.address, ethers.utils.parseEther("200000"));
    

      const amount = ethers.utils.parseEther("10");
      const schoolFees = ethers.utils.parseEther("20");

      const leaf = keccak256(address1.address);
      const proof = merkleTree.getHexProof(leaf);

      const setAmount = await precertificate.connect(owner).setFee(schoolFees,rootHash,token.address,6,9);

      await token
      .connect(address1)
      .approve(precertificate.address, amount);

      const studentPayment = await precertificate.connect(address1).payFee(amount,proof);

      const addressBalance = await token.balanceOf(address1.address);
      console.log("Address one balance 2 is", addressBalance.toString());
      
      const contractBalance = await token.balanceOf(precertificate.address);
      console.log("Address contract balance is", contractBalance.toString());

      expect(contractBalance).to.equal(amount);
    });
    it("checks that the student have completed their payment", async function () {
      const { owner,address1,rootHash, token, precertificate,merkleTree } = await loadFixture(deploysPreCertificateToken);

      await token.mint(address1.address, ethers.utils.parseEther("200000"));
    

      const amount = ethers.utils.parseEther("20");
      const schoolFees = ethers.utils.parseEther("20");

      const leaf = keccak256(address1.address);
      const proof = merkleTree.getHexProof(leaf);

      const setAmount = await precertificate.connect(owner).setFee(schoolFees,rootHash,token.address,6,9);

      await token
      .connect(address1)
      .approve(precertificate.address, amount);

      const studentPayment = await precertificate.connect(address1).payFee(amount,proof);

      const addressBalance = await token.balanceOf(address1.address);
      
      const contractBalance = await token.balanceOf(precertificate.address);

      const checkComplete = await precertificate.checkCompleted(
      address1.address
    );

      expect(checkComplete).to.equal(true);
    });
    it("checks that students can claim their Tokens", async function () {
      const { whitelistAddresses,address1,owner,rootHash, token, precertificate,merkleTree } = await loadFixture(deploysPreCertificateToken);

      await token.mint(address1.address, ethers.utils.parseEther("200000"));
    

      const amount = ethers.utils.parseEther("20");
      const schoolFees = ethers.utils.parseEther("20");

      const addressBalance = await token.balanceOf(address1.address);
      
      const contractBalance = await token.balanceOf(precertificate.address);

      const encodeLeaf = whitelistAddresses.map(addr => keccak256(addr));
      
      const leaf = keccak256(address1.address);
      const proof = merkleTree.getHexProof(leaf);

      const setAmount = await precertificate.connect(owner).setFee(schoolFees,rootHash,token.address,6,9);

      await token
      .connect(address1)
      .approve(precertificate.address, amount);

      const studentPayment = await precertificate.connect(address1).payFee(amount,proof);
      
      const claimToken = await precertificate.connect(address1).claimToken(
      proof
    );
    const cohortStudent = await precertificate.studentDetails(address1.address);

    expect(cohortStudent.claimed).to.equal(true);

    });
});
});
