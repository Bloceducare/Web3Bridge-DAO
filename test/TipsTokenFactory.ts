import { ContractReceipt, Transaction } from "ethers";
import { TransactionDescription, TransactionTypes } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { DiamondCutFacet } from "../typechain-types";
import { getSelectors, FacetCutAction } from "../scripts/libraries/diamond";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { utils } from "ethers";

import { it } from "mocha";

export let DiamondAddress: string;

describe("TipsTokenFactory", function () {
  async function deploysTipsTokenFactoryFacet() {
    const accounts = await ethers.getSigners();
    const contractOwner = accounts[0];

     // deploying Certificate contract
     const Certificate = await ethers.getContractFactory("MockCertificate");
     const certificate = await Certificate.deploy();
 
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
      "OwnershipFacet",
      "TipsTokenFactoryFacet",
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

    return { contractOwner, diamond };
  }

  //////////////////////

  describe("Testing the TipsTokenFactoryFacet Fuctions", function () {
    it("should deploy tipsToken contract", async function() {
        const { contractOwner, diamond } = await loadFixture(deploysTipsTokenFactoryFacet);

        const tokenName = "Web3BridgeCohort VIII Tips";
        const tokenSymbol = "W3BCohortVII"

        const tipsTokenFactory = await ethers.getContractAt(
            "TipsTokenFactoryFacet",
            diamond.address
        );
       

        const deployer = await tipsTokenFactory.deployTipsToken(tokenName, tokenSymbol, contractOwner.address);

        await expect(deployer)
        .to.emit(tipsTokenFactory, "TipsTokenDeployed");
    })
  });

});
