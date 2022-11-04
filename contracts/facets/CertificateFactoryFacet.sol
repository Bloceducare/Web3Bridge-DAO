// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {Certificate} from "../utils/Certificate.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";


/// @dev this contract would be deploying the cerificate of the cohort after cohort ends 
/// @notice only person would has payed their $1500 would be able to mint from the deployed nft 
contract CertificateFactoryFacet {
    // ===============================================
    // ERROR
    // ===============================================



    // ===============================================
    // EVENTS
    // ===============================================
    event CertificateDeployed(string name, string symbol, address certificate_addr, uint256 time);



    /// @notice this function would be handling the deployment 
    /// @dev only the admin of the diamond would be able to call this function 
    function depolyCertificate(string memory name, string memory symbol) external {
        LibDiamond.enforceIsContractOwner();
        Certificate new_certificate = new Certificate(name, symbol);


        emit CertificateDeployed(name, symbol, address(new_certificate), block.timestamp);
    }
}