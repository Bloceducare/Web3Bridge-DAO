// import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// import { expect } from "chai";
// import { ethers } from "hardhat";
// import { TipsTokenFactoryFacet__factory } from "../typechain-types";

// describe("Vault5", function () {
//     async function deployVault5Fixture() {
//         const [owner, otherAccount] = await ethers.getSigners();

//         const Token = await ethers.getContractFactory("Encore");
//         const token = await Token.deploy();

//         const Vault5 = await ethers.getContractFactory("Vault5");
//         const vault5 = await Vault5.deploy(token.address, owner.address);

//         return { owner, otherAccount, vault5, token };
//     }

//     describe("Unit testing for Vault5", function () {

//         it("Deposit certain amount(10) to vault", async function () {
//             // 1
//             const { vault5, token } = await loadFixture(deployVault5Fixture);
//             let amount = ethers.utils.parseEther("10");
//             let increaseAmount = ethers.utils.parseEther("100");
//             await token.increaseAllowance(vault5.address, increaseAmount);
//             await vault5.depositIntoVault(amount, { gasLimit: 2e6 });

//             expect(await token.balanceOf(vault5.address)).to.equal(ethers.utils.parseEther("10"));
//         });

//         it("testing NewDeposit event for addAddressOfEarlyPayment()", async () => {
//             // 2
//             const { vault5 } = await loadFixture(deployVault5Fixture);
//             await expect(vault5.addAddressOfEarlyPayment())
//                 .to.emit(vault5, "NewPaidUser")
//                 .withArgs("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 1);
//         });

//         it("testing NewWithdrawal event for withdrawShare", async function () {
//             // 3
//             const { vault5, token } = await loadFixture(deployVault5Fixture);
          

//         })

//         // it("set withdrawTimeReached variable to 'true'", async function () {
//         //     // 4
//         //     const { vault5 } = await loadFixture(deployVault5Fixture);
//         //     // getter for numberOfPaidUsers
//         //     // const openVault = await vault5.withdrawTimeReached();
//         //     // assert.equal(openVault, true);
//         //     // await expect (vault5.openVault()).to.revertedWith("session has not ended");
//         // });
//     });
// });

