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
  Test1Facet,
} from "../typechain-types";

import { deployDiamond, DiamondAddress } from "../scripts/deploy";
import { FacetStructOutput } from "../typechain-types/DiamondLoupeFacet";

import { ethers } from "hardhat";

import { ContractReceipt } from "ethers";
import { assert } from "chai";

describe("DiamondTest", async function () {
  let diamondCutFacet: DiamondCutFacet;
  let diamondLoupeFacet: DiamondLoupeFacet;
  let ownershipFacet: OwnershipFacet;
  let tx;
  let receipt: ContractReceipt;
  let result;
  const addresses: string[] = [];

  before(async function () {
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
  });

  it("should have three facets -- call to facetAddresses function", async () => {
    for (const address of await diamondLoupeFacet.facetAddresses()) {
      addresses.push(address);
    }

    assert.equal(addresses.length, 3);
  });

  it("facets should have the right function selectors -- call to facetFunctionSelectors function", async () => {
    let selectors = getSelectors(diamondCutFacet);
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
    assert.sameMembers(result, selectors);
    selectors = getSelectors(diamondLoupeFacet);
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[1]);
    assert.sameMembers(result, selectors);
    selectors = getSelectors(ownershipFacet);
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[2]);
    assert.sameMembers(result, selectors);
  });

  it("selectors should be associated to facets correctly -- multiple calls to facetAddress function", async () => {
    assert.equal(
      addresses[0],
      await diamondLoupeFacet.facetAddress("0x1f931c1c")
    );
    assert.equal(
      addresses[1],
      await diamondLoupeFacet.facetAddress("0xcdffacc6")
    );
    assert.equal(
      addresses[1],
      await diamondLoupeFacet.facetAddress("0x01ffc9a7")
    );
    assert.equal(
      addresses[2],
      await diamondLoupeFacet.facetAddress("0xf2fde38b")
    );
  });

  it("should add test1 functions", async () => {
    const Test1Facet = await ethers.getContractFactory("Test1Facet");
    const test1Facet = await Test1Facet.deploy();
    await test1Facet.deployed();
    addresses.push(test1Facet.address);
    const selectors = removeSelectors(getSelectors(test1Facet), [
      " supportsInterface(bytes4)",
    ]);

    tx = await diamondCutFacet.diamondCut(
      [
        {
          facetAddress: test1Facet.address,
          action: FacetCutAction.Add,
          functionSelectors: selectors,
        },
      ],
      ethers.constants.AddressZero,
      "0x",
      { gasLimit: 800000 }
    );
    receipt = await tx.wait();
    if (!receipt.status) {
      throw Error(`Diamond upgrade failed: ${tx.hash}`);
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(test1Facet.address);
    assert.sameMembers(result, selectors);
  });

  it("should test function call", async () => {
    const test1Facet = (await ethers.getContractAt(
      "Test1Facet",
      DiamondAddress
    )) as Test1Facet;
    await test1Facet.test1Func10();
  });

  it("should replace supportsInterface function", async () => {
    const t1facet = await ethers.getContractFactory("Test1Facet");
    const test1Facet = await ethers.getContractFactory("Test1Facet");
    const selectors = getSelectors(t1facet).get(["supportsInterface(bytes4)"]);
    const testFacetAddress = addresses[3];
    tx = await diamondCutFacet.diamondCut(
      [
        {
          facetAddress: testFacetAddress,
          action: FacetCutAction.Replace,
          functionSelectors: selectors,
        },
      ],
      ethers.constants.AddressZero,
      "0x",
      { gasLimit: 800000 }
    );
    receipt = await tx.wait();
    if (!receipt.status) {
      throw Error(`Diamond upgrade failed: ${tx.hash}`);
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(testFacetAddress);
    assert.sameMembers(result, getSelectors(test1Facet));
  });

  it("should add test2 functions", async () => {
    const Test2Facet = await ethers.getContractFactory("Test2Facet");
    const test2Facet = await Test2Facet.deploy();
    await test2Facet.deployed();
    addresses.push(test2Facet.address);
    const selectors = getSelectors(test2Facet);
    tx = await diamondCutFacet.diamondCut(
      [
        {
          facetAddress: test2Facet.address,
          action: FacetCutAction.Add,
          functionSelectors: selectors,
        },
      ],
      ethers.constants.AddressZero,
      "0x",
      { gasLimit: 800000 }
    );
    receipt = await tx.wait();
    if (!receipt.status) {
      throw Error(`Diamond upgrade failed: ${tx.hash}`);
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(test2Facet.address);
    assert.sameMembers(result, selectors);
  });

  it("should remove some test2 functions", async () => {
    const test2Facet = await ethers.getContractAt("Test2Facet", DiamondAddress);
    const functionsToKeep = [
      "test2Func1()",
      "test2Func5()",
      "test2Func6()",
      "test2Func19()",
      "test2Func20()",
    ];
    const selectors = removeSelectors(
      getSelectors(test2Facet),
      functionsToKeep
    );
    tx = await diamondCutFacet.diamondCut(
      [
        {
          facetAddress: ethers.constants.AddressZero,
          action: FacetCutAction.Remove,
          functionSelectors: selectors,
        },
      ],
      ethers.constants.AddressZero,
      "0x",
      { gasLimit: 800000 }
    );
    receipt = await tx.wait();
    if (!receipt.status) {
      throw Error(`Diamond upgrade failed: ${tx.hash}`);
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[4]);
    assert.sameMembers(result, getSelectors(test2Facet).get(functionsToKeep));
  });

  it("should remove some test1 functions", async () => {
    const test1Facet = await ethers.getContractAt("Test1Facet", DiamondAddress);
    const functionsToKeep = ["test1Func2()", "test1Func11()", "test1Func12()"];
    const selectors = removeSelectors(
      getSelectors(test1Facet),
      functionsToKeep
    );
    tx = await diamondCutFacet.diamondCut(
      [
        {
          facetAddress: ethers.constants.AddressZero,
          action: FacetCutAction.Remove,
          functionSelectors: selectors,
        },
      ],
      ethers.constants.AddressZero,
      "0x",
      { gasLimit: 800000 }
    );
    receipt = await tx.wait();
    if (!receipt.status) {
      throw Error(`Diamond upgrade failed: ${tx.hash}`);
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[3]);
    assert.sameMembers(result, getSelectors(test1Facet).get(functionsToKeep));
  });

  it("remove all functions and facets accept 'diamondCut' and 'facets'", async () => {
    let selectors = [];
    let facets = await diamondLoupeFacet.facets();
    for (let i = 0; i < facets.length; i++) {
      selectors.push(...facets[i].functionSelectors);
    }
    selectors = removeSelectors(selectors, [
      "facets()",
      "diamondCut(tuple(address,uint8,bytes4[])[],address,bytes)",
    ]);
    tx = await diamondCutFacet.diamondCut(
      [
        {
          facetAddress: ethers.constants.AddressZero,
          action: FacetCutAction.Remove,
          functionSelectors: selectors,
        },
      ],
      ethers.constants.AddressZero,
      "0x",
      { gasLimit: 800000 }
    );
    receipt = await tx.wait();
    if (!receipt.status) {
      throw Error(`Diamond upgrade failed: ${tx.hash}`);
    }
    facets = await diamondLoupeFacet.facets();
    assert.equal(facets.length, 2);
    assert.equal(facets[0][0], addresses[0]);
    assert.sameMembers(facets[0][1], ["0x1f931c1c"]);
    assert.equal(facets[1][0], addresses[1]);
    assert.sameMembers(facets[1][1], ["0x7a0ed627"]);
  });

  it("add most functions and facets", async () => {
    const diamondLoupeFacetSelectors = removeSelectors(
      getSelectors(diamondLoupeFacet),
      ["supportsInterface(bytes4)"]
    );
    const test1Facet = await ethers.getContractFactory("Test1Facet");
    const test2Facet = await ethers.getContractFactory("Test2Facet");
    // Any number of functions from any number of facets can be added/replaced/removed in a
    // single transaction
    const cut = [
      {
        facetAddress: addresses[1],
        action: FacetCutAction.Add,
        functionSelectors: removeSelectors(diamondLoupeFacetSelectors, [
          "facets()",
        ]),
      },
      {
        facetAddress: addresses[2],
        action: FacetCutAction.Add,
        functionSelectors: getSelectors(ownershipFacet),
      },

      {
        facetAddress: addresses[3],
        action: FacetCutAction.Add,
        functionSelectors: getSelectors(test1Facet),
      },
      {
        facetAddress: addresses[4],
        action: FacetCutAction.Add,
        functionSelectors: getSelectors(test2Facet),
      },
    ];
    tx = await diamondCutFacet.diamondCut(
      cut,
      ethers.constants.AddressZero,
      "0x",
      { gasLimit: 8000000 }
    );
    receipt = await tx.wait();
    if (!receipt.status) {
      throw Error(`Diamond upgrade failed: ${tx.hash}`);
    }
    const facets: FacetStructOutput[] = await diamondLoupeFacet.facets();
    const facetAddresses = await diamondLoupeFacet.facetAddresses();
    assert.equal(facetAddresses.length, 5);
    assert.equal(facets.length, 5);
    assert.sameMembers(facetAddresses, addresses);
    assert.equal(facets[0][0], facetAddresses[0], "first facet");
    assert.equal(facets[1][0], facetAddresses[1], "second facet");
    assert.equal(facets[2][0], facetAddresses[2], "third facet");
    assert.equal(facets[3][0], facetAddresses[3], "fourth facet");
    assert.equal(facets[4][0], facetAddresses[4], "fifth facet");
    assert.sameMembers(
      //@ts-ignore
      facets[findAddressPositionInFacets(addresses[0], facets)][1],
      getSelectors(diamondCutFacet)
    );
    assert.sameMembers(
      //@ts-ignore
      facets[findAddressPositionInFacets(addresses[1], facets)][1],
      diamondLoupeFacetSelectors
    );
    assert.sameMembers(
      //@ts-ignore
      facets[findAddressPositionInFacets(addresses[2], facets)][1],
      getSelectors(ownershipFacet)
    );
    assert.sameMembers(
      //@ts-ignore
      facets[findAddressPositionInFacets(addresses[3], facets)][1],
      getSelectors(test1Facet)
    );
    assert.sameMembers(
      //@ts-ignore
      facets[findAddressPositionInFacets(addresses[4], facets)][1],
      getSelectors(test2Facet)
    );
  });
});
