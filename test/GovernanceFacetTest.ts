// import { ContractReceipt, Transaction } from "ethers";
// import { TransactionDescription, TransactionTypes } from "ethers/lib/utils";
// import { ethers } from "hardhat";
// import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
// import { utils } from "ethers";
// import { it } from "mocha";
// import MerkleTree from "merkletreejs";
// import keccak256 from "keccak256";
// import {
//   getSelectors,
//   FacetCutAction,
//   removeSelectors,
//   findAddressPositionInFacets,
// } from "../scripts/libraries/diamond";
// import {
//   DiamondCutFacet,
//   DiamondLoupeFacet,
//   OwnershipFacet,
//   GovernanceFacet,
// } from "../typechain-types";
// import { deployDiamond, DiamondAddress, DAO_TOKEN } from "../scripts/deploy";
// import { FacetStructOutput } from "../typechain-types/DiamondLoupeFacet";
// import { assert, expect } from "chai";

// describe("GovenanceFacet", function () {
//   async function deploysGovernanceFacet() {
//     const accounts = await ethers.getSigners();
//     const [owner, otherAccount, addr1, add2] = await ethers.getSigners();
//     let diamondCutFacet: DiamondCutFacet;
//     let diamondLoupeFacet: DiamondLoupeFacet;
//     let ownershipFacet: OwnershipFacet;
//     let tx;
//     let receipt: ContractReceipt;
//     let result;
//     const addresses: string[] = [];

//     let governmentFacet: GovernanceFacet;

//     await deployDiamond();
//     diamondCutFacet = await ethers.getContractAt(
//       "DiamondCutFacet",
//       DiamondAddress
//     );
//     diamondLoupeFacet = await ethers.getContractAt(
//       "DiamondLoupeFacet",
//       DiamondAddress
//     );
//     ownershipFacet = await ethers.getContractAt(
//       "OwnershipFacet",
//       DiamondAddress
//     );
//     governmentFacet = await ethers.getContractAt(
//       "GovernanceFacet",
//       DiamondAddress
//     );

//     const students = await ethers.getSigners();
//     const leafNodes = students.map((student) => keccak256(student.address));
//     const merkleTree = new MerkleTree(leafNodes, keccak256, {
//       sortPairs: true,
//     });
//     const rootHash = merkleTree.getHexRoot();
//     const claimingAddress = students[0];
//     const hexProof = merkleTree.getHexProof(keccak256(claimingAddress.address));

//     await DAO_TOKEN.setMerkleRoot(rootHash);
//     await DAO_TOKEN.setMintAmountPerPerson("20");
//     await DAO_TOKEN.enableMinting(true);
//     await DAO_TOKEN.mint(hexProof);

//     return {
//       diamondCutFacet,
//       diamondLoupeFacet,
//       ownershipFacet,
//       governmentFacet,
//       addr1,
//       DAO_TOKEN,
//       owner,
//       hexProof,
//     };
//   }

//   /////////////////

//   describe("Testing GovernanceFacet Functions", function () {
//     it("should check that proposal count is zero if proposal is not created", async function () {
//       const { governmentFacet } = await loadFixture(deploysGovernanceFacet);

//       const proposalCount = await governmentFacet.proposalCount();
//       expect(proposalCount).to.equal("0");
//     });

//     it("should create a proposal and ensure proposalCount increased", async function () {
//       const { governmentFacet } = await loadFixture(deploysGovernanceFacet);
//       const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

//       const createProposal = await governmentFacet.createProposal(
//         "Get a House",
//         deadline
//       );
//       const createProposalTnx = await createProposal.wait();

//       const proposalCount = await governmentFacet.proposalCount();

//       expect(proposalCount).to.equal("1");
//     });

//     it("should vote for a proposal and do all scenario checks", async function () {
//       const { governmentFacet, owner, DAO_TOKEN } = await loadFixture(
//         deploysGovernanceFacet
//       );
//       const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

//       const createProposal = await governmentFacet.createProposal(
//         "Buy a House",
//         deadline
//       );
//       await createProposal.wait();
//       const proposalCount = await governmentFacet.proposalCount();
//       expect(proposalCount).to.equal("1");

//       const setMaxVoteWeight = await governmentFacet.setMaxVoteWeight(2);
//       await setMaxVoteWeight.wait();

//       // Vote for created proposal
//       const voteProposal = await governmentFacet.voteProposal(1, 1, 2);
//       await voteProposal.wait();

//       const totalVoteCount = await governmentFacet.totalVoteCount();
//       expect(totalVoteCount).to.equal("1");

//       // Check user token balance after vote
//       const expectedBalance = ethers.utils.parseEther("18");
//       const userNewTokenBalance = await DAO_TOKEN.balanceOf(owner.address);
//       expect(userNewTokenBalance).to.equal(expectedBalance);

//       /// Create Another proposal
//       const createNewProposal = await governmentFacet.createProposal(
//         "Buy a Car",
//         deadline
//       );

//       await createNewProposal.wait();

//       const proposalCount2 = await governmentFacet.proposalCount();
//       expect(proposalCount2).to.equal("2");

//       // Vote for same created proposal and check vote count
//       const voteAnotherProposal = await governmentFacet.voteProposal(2, 1, 2);
//       await voteAnotherProposal.wait();

//       const totalVoteCount2 = await governmentFacet.totalVoteCount();
//       expect(totalVoteCount2).to.equal("2");

//       // Fetch proposals and check count(array length)
//       const getProposals = await governmentFacet.getProposals();
//       expect(getProposals.length).to.equal(2);

//       // Fetch voters of each proposal and get check array length
//       const getVoters = await governmentFacet.getVoters(1);
//       expect(getVoters.length).to.equal(1);

//       const getVoters2 = await governmentFacet.getVoters(2);
//       expect(getVoters2.length).to.equal(1);
//     });

//     it("should revert when voted on a cancelled proposal", async function () {
//       const { governmentFacet, DAO_TOKEN, owner } = await loadFixture(
//         deploysGovernanceFacet
//       );
//       const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

//       const createProposal = await governmentFacet.createProposal(
//         "Get another House",
//         deadline
//       );
//       await createProposal.wait();
//       const proposalCount = await governmentFacet.proposalCount();
//       expect(proposalCount).to.equal("1");

//       const cancelProposal = await governmentFacet.cancelProposal(1);
//       await cancelProposal.wait();

//       // Try voting for a cancelled proposal
//       await expect(governmentFacet.voteProposal(1, 1, 2)).to.be.revertedWith(
//         "proposalIsCancelled()"
//       );
//     });
//   });
// });
