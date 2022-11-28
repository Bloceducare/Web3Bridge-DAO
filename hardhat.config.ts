/* global task ethers */

import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
require("hardhat-contract-sizer");
require("dotenv").config();
require("solidity-coverage");
require("hardhat-tracer");

// You have to export an object to set up your config
// This object can have the following optional entries:
// defaultNetwork, networks, solc, and paths.
// Go to https://buidler.dev/config/ to learn more
module.exports = {
  mocha: {
    timeout: 100000000,
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY,
  },
  networks: {
    hardhat: {
      blockGasLimit: 20000000,
      timeout: 120000,
      gas: "auto",
    },
    localhost: {
      timeout: 8000000,
    },
    mumbai: {
      url: process.env.ALCHEMY_MUMBAI_URL,
      accounts: [process.env.PRIVATE_KEY],
    }
  },
  gasReporter: {
    currency: "USD",
    gasPrice: 100,
    enabled: false,
  },
  contractSizer: {
    alphaSort: false,
    runOnCompile: false,
    disambiguatePaths: true,
  },
  // This is a sample solc configuration that specifies which version of solc to use
  solidity: {
    compilers: [
      {
        version: "0.8.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
};
