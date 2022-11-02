import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { utils } from "ethers";

describe("DAOtoken", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploysDaotoken() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, add3] = await ethers.getSigners();

    const DAOtoken = await ethers.getContractFactory("DAOtoken");
    const daotoken = await DAOtoken.deploy();

    return {owner, otherAccount, add3, daotoken};
  }

  describe("Mint tokens to members", function () {
    it("Should Mint tokens when ........", async function () {
        const {owner, otherAccount, add3, daotoken} = await loadFixture(deploysDaotoken);
    });
    
  });
});
