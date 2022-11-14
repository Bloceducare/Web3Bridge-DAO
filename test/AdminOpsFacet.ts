// // import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
// // import { expect } from "chai";
// import { ethers } from "hardhat";

// const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
// const { expect } = require("chai");

// describe("AdminOpsFacet contract", function () {
//   async function deployTokenFixture() {
//     // deploy the Diamond.sol
//     const Diamond = await ethers.getContractFactory("LibDiamond");
//     const AdminOpsFacet = await ethers.getContractFactory("AdminOpsFacet");

//     const [owner, addr1, addr2] = await ethers.getSigners();

//     const hardhatToken = await AdminOpsFacet.deploy();
//     const daimond = await Diamond.deploy();

//     await hardhatToken.deployed();
//     await daimond.deployed();

//     // Fixtures can return anything you consider useful for your tests
//     return { AdminOpsFacet, hardhatToken, owner, addr1, addr2 };
//   }

//   it("Should return mint_pre_cert_token to an address", async function () {
//     const { hardhatToken, owner, addr1 } = await loadFixture(
//       deployTokenFixture
//     );
//     //hardhatToken.connect(addr1).mint.
//     const ownerBalance = await hardhatToken.mint_pre_cert_token(
//       "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
//     );

//     await ownerBalance.wait();
//     // expect(await hardhatToken.mint_pre_cert_token).to.equal(ownerBalance);
//   });
// });

/* global describe it before ethers */

import {
  getSelectors,
  FacetCutAction,
  removeSelectors,
  findAddressPositionInFacets,
} from "../scripts/libraries/diamond";
import {
  DiamondCutFacet,
  DiamondLoupeFacet,
  OwnershipFacet,
  AdminOpsFacet,
} from "../typechain-types";

import { deployDiamond, DiamondAddress } from "../scripts/deploy";
import { FacetStructOutput } from "../typechain-types/DiamondLoupeFacet";

import { ethers } from "hardhat";

import { ContractReceipt } from "ethers";
import { assert, expect } from "chai";
import { loadFixture } from "ethereum-waffle";

describe("DiamondTest", function () {
  async function deployAdmin() {
    let diamondCutFacet: DiamondCutFacet;
    let diamondLoupeFacet: DiamondLoupeFacet;
    let ownershipFacet: OwnershipFacet;
    let tx;
    let receipt: ContractReceipt;
    let result;
    const addresses: string[] = [];
    const [owner, addr1, addr2] = await ethers.getSigners();

    let adminOps: AdminOpsFacet;

    await deployDiamond();
    diamondCutFacet = await ethers.getContractAt(
      "DiamondCutFacet",
      DiamondAddress
    );
    diamondLoupeFacet = await ethers.getContractAt(
      "DiamondLoupeFacet",
      DiamondAddress
    );
    ownershipFacet = await ethers.getContractAt(
      "OwnershipFacet",
      DiamondAddress
    );
    adminOps = await ethers.getContractAt("AdminOpsFacet", DiamondAddress);

    return {
      diamondCutFacet,
      diamondLoupeFacet,
      ownershipFacet,
      adminOps,
      addr1,
    };
  }

  describe("mint pre-cert", function () {
    it("testing checkuserbalance", async function () {
      const { adminOps, addr1 } = await loadFixture(deployAdmin);
      await adminOps.blacklist_address(addr1.address);
      // await adminOps.mint_pre_cert_token(addr1.address);
    });
  });
});
