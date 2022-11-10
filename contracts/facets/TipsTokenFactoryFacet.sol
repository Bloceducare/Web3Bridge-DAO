// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// import {TipsToken} from "../utils/TipsToken.sol";
// import {LibDiamond} from "../libraries/LibDiamond.sol";

// /// @dev this contract deploys the TipsToken contract
// contract TipsTokenFactoryFacet {
//     /// EVENTS
//     event TipsTokenDeployed(string tokenName, string tokenSymbol, uint8 tokenDecimal, uint256 tokenSupply, address tipsTokenAddress);

//     /// This function deploys the tips token and accepts four arguments
//     function deployTipsToken(
//         string memory _tokenName,
//         string memory _tokenSymbol,
//         uint8 _tokenDecimal,
//         uint256 tokenSupply
//     ) external {
//         LibDiamond.enforceIsContractOwner();
//         TipsToken deployedTipsToken = new TipsToken(_tokenName, _tokenSymbol, _tokenDecimal, tokenSupply);

//         emit TipsTokenDeployed(_tokenName, _tokenSymbol, _tokenDecimal, tokenSupply, address(deployedTipsToken));
//     }
// }
