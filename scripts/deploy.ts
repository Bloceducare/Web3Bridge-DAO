/* global ethers */
/* eslint prefer-const: "off" */

import { ContractReceipt, Transaction } from "ethers";
import { TransactionDescription, TransactionTypes } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { DiamondCutFacet } from "../typechain-types";
import { getSelectors, FacetCutAction } from "./libraries/diamond";

export let DiamondAddress: string;

export async function deployDiamond() {
  const accounts = await ethers.getSigners();
  const contractOwner = accounts[0];
  const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const DAO_TRESURY = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" // this is the address 5% would sent to finance the dao opearations ======= CHANGE ADDRESS =======

  // deploy DiamondCutFacet
  const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
  const diamondCutFacet = await DiamondCutFacet.deploy();
  await diamondCutFacet.deployed();
  console.log("DiamondCutFacet deployed:", diamondCutFacet.address);

  // deploying vault 10
  const Vault10 = await ethers.getContractFactory("Vault10");
  const vault10 = await Vault10.deploy(USDC_ADDRESS, contractOwner.address);
  await vault10.deployed();
  console.log("10% vault has been deployed: ", vault10.address);

  //deploying vault 5
  const Vault5 = await ethers.getContractFactory("Vault5");
  const vault5 = await Vault5.deploy(USDC_ADDRESS, contractOwner.address);
  await vault5.deployed();
  console.log("5% vault has been deployed: ", vault5.address);



  // deploy pre certificate token
  const PreCert = await ethers.getContractFactory("PreCertificateToken");
  const preCert = await PreCert.deploy(contractOwner.address, vault10.address, vault5.address, DAO_TRESURY);
  await preCert.deployed();
  console.log("Deployed Pre Certificate token: ", preCert.address);

  // deploy DAO token
  const DAOToken = await ethers.getContractFactory("DAOtoken");
  const _DAOToken = await DAOToken.deploy();
  await _DAOToken.deployed();



  // deploy Diamond
  const Diamond = await ethers.getContractFactory("Diamond");
  const diamond = await Diamond.deploy(
    contractOwner.address,
    diamondCutFacet.address,
    _DAOToken.address,
    preCert.address
  );
  await diamond.deployed();
  console.log("Diamond deployed:", diamond.address);

  // transferring ownership of DAOToken to the diamond 
  await _DAOToken.setDiamondAddress(diamond.address);

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
  const FacetNames = ["DiamondLoupeFacet", "OwnershipFacet", "AdminOpsFacet", "CertificateFactoryFacet", "GovernanceFacet", "TipsTokenFactoryFacet"];
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
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deployDiamond()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.deployDiamond = deployDiamond;
