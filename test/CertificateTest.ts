import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect, assert } from "chai";
import { ethers } from "hardhat";
import { utils } from "ethers";

import { it } from "mocha";

describe("Certificate", function () {
  async function deploysCertificate() {
    const [owner, otherAccount, add2] = await ethers.getSigners();

    const certificate = await ethers.getContractFactory("Certificate");
    const Certificate = await certificate.deploy(
      "Web3bridge",
      "W3B",
      "0x1c7E83f8C581a967940DBfa7984744646AE46b29"
    );

    return { owner, otherAccount, Certificate, add2 };
  }

  /////////////////

  describe("testing", function () {
    it("checks certificate contract is deployed successfully", async function () {
      const { Certificate } = await loadFixture(deploysCertificate);
      assert.ok(Certificate.address);
    });

    it("checks merkle root can only be set by admin", async function () {
      const { Certificate, owner, add2, otherAccount } = await loadFixture(
        deploysCertificate
      );
      await Certificate.connect(owner).setMerkleRoot(
        "0x1ff77183e788ec49a77372b8a9b25d257f122d4b9a272d30059db58e0dbbae49"
      );
      const merkleRoot = await Certificate.merkle_root();
      assert.equal(
        merkleRoot,
        "0x1ff77183e788ec49a77372b8a9b25d257f122d4b9a272d30059db58e0dbbae49"
      );
      console.log("Merkle root is successfully set: ", merkleRoot);
    });

    it("checks if a user is whitelisted", async function () {
      const proofs = [
        "0x1730e4892e0e4c31edf7250c627163f2b55569e6ffad26072b0006b05a959acd",
        "0x9f1cd4464fee066c7b3ae6c21e5571f729f483dd195be66ca8d701d20fee018a",
      ];

      const { Certificate } = await loadFixture(deploysCertificate);
      
      const checkIsWhitelisted = await Certificate.isWhitelisted(
        proofs,
        "0xe9707d0e6171f728f7473c24cc0432a9b07eaaf1efed6a137a4a8c12c79552d9"
      );
      assert.equal(checkIsWhitelisted, false);
    });
  });
});
