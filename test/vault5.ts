// import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
// import { expect } from "chai";
// import { ethers } from "hardhat";
// import { utils } from "ethers";

// import { it } from "mocha";

// describe("Vault5", function () {
//   async function deploysVaultAndToken() {
//     const [admin, student1, student2] = await ethers.getSigners();

//     const Token = await ethers.getContractFactory("VaultToken");
//     const token = await Token.deploy("Tether", "USDT");

//     const Vault5 = await ethers.getContractFactory("Vault5");
//     const vault5 = await Vault5.deploy(token.address, admin.address);


//     return { admin, student1, student2,  token, vault5 };
//   }


  
//   describe("Vault 5 Test", function () {
//     it("Ensure the admin have deposited in vault contract", async function () {
//       const {  admin, student1, student2,  token, vault5} = await loadFixture(
//         deploysVaultAndToken
//       );
//      const depositValue = ethers.utils.parseEther("20000")
//       await token.connect(admin).mint(admin.address, ethers.utils.parseEther("200000"))
//       const balanceOfadmin = await token.connect(admin).balanceOf(admin.address)
//       console.log("admin balance is", balanceOfadmin.toString())
//       await token.connect(admin).approve(vault5.address, ethers.utils.parseEther("100000000000"))
//       await vault5.connect(admin).depositIntoVault(depositValue)
//       expect(await vault5.returnVaultBalace()).to.equal(depositValue);
//     });
//     // Ensure that student cannot withdraw until the Vault is open

//     it("Check if vault is open", async function () {
//         const {  admin, student1, student2,  token, vault5} = await loadFixture(
//             deploysVaultAndToken
//           );

//       const depositValue = ethers.utils.parseEther("20000")
//       await token.mint(admin.address, ethers.utils.parseEther("200000"))
//       await token.connect(admin).approve(vault5.address, ethers.utils.parseEther("100000000000"))
//       await vault5.connect(admin).depositIntoVault(depositValue)
//       await vault5.connect(admin).openVault()
      
//       expect(await vault5.checkIfWithdrawTimeReached()).to.equal(true)     

//     });

//     it("Ensure that student can withdraw just their share  ", async function () {
//       const {  admin, student1, student2,  token, vault5} = await loadFixture(
//         deploysVaultAndToken
//       );

//       const depositValue = ethers.utils.parseEther("20000")
//       await token.mint(admin.address, ethers.utils.parseEther("200000"))
//       await token.connect(admin).approve(vault5.address, ethers.utils.parseEther("100000000000"))
//       await vault5.connect(admin).depositIntoVault(depositValue)
//       await vault5.connect(admin).openVault()
//       await vault5.connect(student1).addAddressOfEarlyPayment()
//       await vault5.connect(student2).addAddressOfEarlyPayment()
//       await vault5.connect(student2).withdrawShare()
//       const student2bal = ethers.utils.parseEther("10000")
//       const bal = await (await token.balanceOf(student2.address)).toString()
//       console.log("this is the balance", bal)

//       expect(await token.balanceOf(student2.address)).to.equal(student2bal)   
//         });

   
//   });


//   it("Test to ensure that only admin can open vault", async function () {
//     const {  admin, student1, student2,  token, vault5} = await loadFixture(
//         deploysVaultAndToken
//       );
//   await vault5.connect(admin).openVault()
//   expect(await vault5.checkIfWithdrawTimeReached()).to.equal(true)     

// });



// });