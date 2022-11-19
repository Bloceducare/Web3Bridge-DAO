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

describe("GovenanceFacet", function () {
  async function deploysGovernanceFacet() {
    const accounts = await ethers.getSigners();
    const contractOwner = accounts[0];
    const [owner, otherAccount, add2] = await ethers.getSigners();

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

    return { owner, otherAccount, daotoken, certificate, add2, diamond };
  }

  /////////////////

  describe("Testing GovernanceFacet Functions", function () {
    it("should check that proposal count is zero if proposal is not created", async function () {
      const { diamond } = await loadFixture(deploysGovernanceFacet);

      const governance = await ethers.getContractAt(
        "GovernanceFacet",
        diamond.address
      );

      const proposalCount = await governance.proposalCount();
      expect(proposalCount).to.equal("0");
    });

    it("should create a proposal and ensure proposalCount increased", async function () {
      const { diamond } = await loadFixture(deploysGovernanceFacet);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

      const governance = await ethers.getContractAt(
        "GovernanceFacet",
        diamond.address
      );

      const createProposal = await governance.createProposal(
        "Get a House",
        deadline
      );
      const createProposalTnx = await createProposal.wait();

      const proposalCount = await governance.proposalCount();

      expect(proposalCount).to.equal("1");
    });

    it("should vote for a proposal and do all scenario checks", async function () {
      const { daotoken, certificate, diamond, owner } = await loadFixture(
        deploysGovernanceFacet
      );
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

      /// Ensure user has the NFT certificate and Dao token
      const daoTokenOwner = await daotoken.getOwner();
      expect(daoTokenOwner).to.equal(owner.address);

      const enableMinting = await daotoken.enableMinting(true);
      await enableMinting.wait();

      const mintCertificate = await certificate.safeMint(owner.address, 1);
      await mintCertificate.wait();

      const mintDaoToken = await daotoken.mint();
      await mintDaoToken.wait();

      const amountPerPerson = ethers.utils.parseEther("20");
      const userTokenBalance = await daotoken.balanceOf(owner.address);
      expect(userTokenBalance).to.equal(amountPerPerson);

      // Create a proposal before voting
      const governance = await ethers.getContractAt(
        "GovernanceFacet",
        diamond.address
      );

      const createProposal = await governance.createProposal(
        "Buy a House",
        deadline
      );
      await createProposal.wait();
      const proposalCount = await governance.proposalCount();
      expect(proposalCount).to.equal("1");

      const setMaxVoteWeight = await governance.setMaxVoteWeight(2);
      await setMaxVoteWeight.wait();

      // Vote for created proposal
      const voteProposal = await governance.voteProposal(1, 1, 2);
      await voteProposal.wait();

      const totalVoteCount = await governance.totalVoteCount();
      expect(totalVoteCount).to.equal("1");

      // Check user token balance after vote
      const expectedBalance = ethers.utils.parseEther("18");
      const userNewTokenBalance = await daotoken.balanceOf(owner.address);
      expect(userNewTokenBalance).to.equal(expectedBalance);

      /// Create Another proposal
      const createNewProposal = await governance.createProposal(
        "Buy a Car",
        deadline
      );

      await createNewProposal.wait();

      const proposalCount2 = await governance.proposalCount();
      expect(proposalCount2).to.equal("2");

      // Vote for same created proposal and check vote count
      const voteAnotherProposal = await governance.voteProposal(2, 1, 1);
      await voteAnotherProposal.wait();

      const totalVoteCount2 = await governance.totalVoteCount();
      expect(totalVoteCount2).to.equal("2");

      // Fetch proposals and check count(array length)
      const getProposals = await governance.getProposals();
      expect(getProposals.length).to.equal(2);

      // Fetch voters of each proposal and get check array length
      const getVoters = await governance.getVoters(1);
      expect(getVoters.length).to.equal(1);

      const getVoters2 = await governance.getVoters(2);
      expect(getVoters2.length).to.equal(1);
    });

    it("should revert when voted on a cancelled proposal", async function () {
      const { diamond, daotoken, certificate, owner } = await loadFixture(
        deploysGovernanceFacet
      );
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

      const governance = await ethers.getContractAt(
        "GovernanceFacet",
        diamond.address
      );

      const createProposal = await governance.createProposal(
        "Get another House",
        deadline
      );
      await createProposal.wait();
      const proposalCount = await governance.proposalCount();
      expect(proposalCount).to.equal("1");

      const cancelProposal = await governance.cancelProposal(1);
      await cancelProposal.wait();

      /// Ensure user has the NFT certificate and Dao token
      const daoTokenOwner = await daotoken.getOwner();
      expect(daoTokenOwner).to.equal(owner.address);

      const enableMinting = await daotoken.enableMinting(true);
      await enableMinting.wait();

      const mintCertificate = await certificate.safeMint(owner.address, 1);
      await mintCertificate.wait();

      const mintDaoToken = await daotoken.mint();
      await mintDaoToken.wait();

      const amountPerPerson = ethers.utils.parseEther("20");
      const userTokenBalance = await daotoken.balanceOf(owner.address);
      expect(userTokenBalance).to.equal(amountPerPerson);

      // Try voting for a cancelled proposal
      await expect(governance.voteProposal(1, 1, 2)).to.be.revertedWith(
        "proposalIsCancelled()"
      );
    });
  });
});
