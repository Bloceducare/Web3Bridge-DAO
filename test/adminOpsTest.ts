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
  
  
  
  
  describe("AdminOPs Test", function () {
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
  
    describe("mint_pre_cert_token", function () {
      it("blacklist address", async function () {
        const { adminOps, addr1 } = await loadFixture(deployAdmin);
        // await adminOps.blacklist_address(addr1.address);
        // let black_status = await adminOps.is_blacklisted(addr1.address);
        // console.log("black_status", black_status);
        // expect(black_status).to.be.equal(true);
      });
  
      // it("mint_pre_cert_token", async function () {
      //   const { adminOps, addr1 } = await loadFixture(deployAdmin);
      //   await adminOps.mint_pre_cert_token(addr1.address);
      // });
    });
  
  
  });