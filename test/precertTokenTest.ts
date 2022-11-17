import { ContractReceipt, Transaction } from "ethers";
import { TransactionDescription, TransactionTypes } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { DiamondCutFacet } from "../typechain-types";
import { getSelectors, FacetCutAction } from "../scripts/libraries/diamond";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
const helpers = require("@nomicfoundation/hardhat-network-helpers");
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";

import { utils } from "ethers";

const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");

export let DiamondAddress: string;

function encodeLeaf(address: any, spots: any) {
  // Same as `abi.encodePacked` in Solidity
  return ethers.utils.defaultAbiCoder.encode(
    ["address", "uint64"],
    [address, spots]
  );
}

describe("PreCertificateToken", function () {
  async function deploysPreCertificateToken() {
    // Getting the contract signers
    const accounts = await ethers.getSigners();
    const contractOwner = accounts[0];
    const [owner, otherAccount, add2] = await ethers.getSigners();
    const _vault5_ = "0x15ebc0b718d082c7a09c75bd5f04ee2460419cc7"


    // deploying Token contract
    const Token = await ethers.getContractFactory("TipsToken");
    const token = await Token.deploy('TipsToken', 'TT',owner.address);

    // deploying vault10 contract
    const Vault10 = await ethers.getContractFactory("vault1");
    const vault10 = await Vault10.deploy(token.address, owner.address);

    // deploying vault5 contract
    const Vault5 = await ethers.getContractFactory("Vault5");
    const vault5 = await Vault5.deploy(token.address, owner.address);

     // deploying Certificate contract
     const Certificate = await ethers.getContractFactory("Certificate");
     const certificate = await Certificate.deploy('CERTIFICATENFT', 'cNFT',otherAccount.address);

    // deploying DAO token contract
    const DAOtoken = await ethers.getContractFactory("DAOtoken");
    const daotoken = await DAOtoken.deploy(certificate.address);

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
      "OwnershipFacet"
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

     // deploying Certificate contract
     const PrCertificate = await ethers.getContractFactory("PreCertificateToken");
     const precertificate = await PrCertificate.deploy(owner.address,vault10.address,vault5.address, _vault5_ ,diamond.address);
     await precertificate.deployed();

    return { owner, otherAccount, vault10, vault5, diamond, precertificate,token };
  }

  /////////////////



    describe("Testing PreCertificateToken Functions", function () {

      it("should verify the whitelisted addresses and payFee", async function () {
        const { precertificate,token } = await loadFixture(
          deploysPreCertificateToken
        );
        
        // Create an array of elements you wish to encode in the Merkle Tree
        const graduands = [
          encodeLeaf("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 2),
          encodeLeaf("0x978eb4bef0a31f9e582f194a72cff24f0d6cd821", 2),
          encodeLeaf("0x624b6e2ee9a60ab1f525cd253debaa20bd88336d", 2),
          encodeLeaf("0x8b77925bbdef4a09550bc5b21009ff007b05e242", 2),
          encodeLeaf("0x42E0e153135863c41301aDaaC83Cf3e5248aDF9c", 2),
          encodeLeaf("0x8d757d94a110edf1cea65c19790415050e404566", 2),
          encodeLeaf("0x95f209735f386455334099021d8ab360f1e5046c", 2),
          encodeLeaf("0xc02b594f40fd06785bfa94a245340bb964a877ae", 2),
          encodeLeaf("0x0a01b55e847d1f232dcd65822ad5a2133bcb96ce", 2),
          encodeLeaf("0xb90b5dcab4b7434c6e98b9648b4f6259d49d8437", 2),
          encodeLeaf("0xe3d9d29710b10bcc663a3072c03617354f736284", 2),
          encodeLeaf("0xd051c77dd1c94b34143cc90ecdf13f793631ab00", 2),
        ];
    
        const merkleTree = new MerkleTree(graduands, keccak256, {
          hashLeaves: true,
          sortPairs: true, // this makes the leafs even (2 ** n)
        });
    
        const rootHash = merkleTree.getHexRoot();

        console.log(".......rootHash is.......", rootHash);

        const USDTaddr = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
        const USDTholder = "0x42E0e153135863c41301aDaaC83Cf3e5248aDF9c";
        
        await helpers.impersonateAccount(USDTholder);
        const Signer = await ethers.getSigner(USDTholder);

        await helpers.setBalance(USDTholder, ethers.utils.parseEther("4000000"));
        const signerBalance = await Signer.getBalance();
      console.log("The balance of the Signer is SignerBalance: ", signerBalance);

        let amount = ethers.utils.parseEther("100");
        let fee = ethers.utils.parseEther("1500");
    
        const leaf = keccak256(graduands[4]);
        const proof = merkleTree.getHexProof(leaf);

        console.log(".....proof is......", proof);

        await precertificate.setFee(fee, rootHash, USDTaddr, 2, 1);


    
        let verified = await precertificate.connect(Signer).payFee(amount,proof);

        let result = await verified.wait();
        console.log ("result ====" , result)

      const checkComplete =   await precertificate.checkCompleted("0x42E0e153135863c41301aDaaC83Cf3e5248aDF9c");
        console.log(checkComplete)
        //expect(await token.balanceOf(precertificate.address)).to.equal(amount);
        //expect(await token.balanceOf(precertificate.address)).to.be.reverted;
      });

  
    });
});