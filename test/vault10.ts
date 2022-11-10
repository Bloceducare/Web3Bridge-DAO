import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { TipsTokenFactoryFacet__factory } from "../typechain-types";

describe("Vault10", function () {
    async function deployVault10Fixture() {
        const [owner, otherAccount] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("Encore");
        const token = await Token.deploy();

        const Vault10 = await ethers.getContractFactory("Vault10");
        const vault10 = await Vault10.deploy(token.address, owner.address);

        return { owner, otherAccount, vault10, token };
    }

    describe("Unit testing for Vault10", function () {
        it("Contract and tokens should successfully deploy", async function () {
            // 1
            console.log("success!");
            // const {owner, vault10, token} = await loadFixture(deployVault10Fixture);
            // console.log(owner.address, vault10.address, token.address) // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 0x5FbDB2315678afecb367f032d93F642f64180aa3
        });

        it("Deposit certain amount(10) to vault", async function () {
            // 2
            const { vault10, token } = await loadFixture(deployVault10Fixture);
            let amount = ethers.utils.parseEther("10");
            let increaseAmount = ethers.utils.parseEther("100");
            await token.increaseAllowance(vault10.address, increaseAmount);
            await vault10.depositIntoVault(amount, { gasLimit: 2e6 });

            expect(await token.balanceOf(vault10.address)).to.equal(ethers.utils.parseEther("10"));
        });

        it("testing NewDeposit event for addAddressOfEarlyPayment()", async () => {
            // 3
            const { vault10 } = await loadFixture(deployVault10Fixture);
            await expect(vault10.addAddressOfEarlyPayment())
                .to.emit(vault10, "NewPaidUser")
                .withArgs("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 1);
        });

        it("testing NewWithdrawal event for withdrawShare", async function () {
            // 4
            const { vault10, token } = await loadFixture(deployVault10Fixture);
            const owner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
            // await token.transfer(owner, 10, { gasLimit: 2e6 })
            await expect(vault10.withdrawShare(owner))
                .to.emit(vault10, "NewWithdrawal")
                .withArgs(owner, 10);

        })

        it("set withdrawTimeReached variable to 'true'", async function () {
            // 5
            const { vault10 } = await loadFixture(deployVault10Fixture);
            // getter for numberOfPaidUsers
            // const openVault = await vault10.withdrawTimeReached();
            // assert.equal(openVault, true);
            // await expect (vault10.openVault()).to.revertedWith("session has not ended");
        });
    });
});

