// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {IHasPaid} from "../interfaces/IHasPaid.sol";

pragma solidity ^0.8.4;

contract Certificate is ERC721, ERC721URIStorage, Ownable {
    bytes32 merkle_root;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    mapping(address => bool) hasMinted;

    address haspaid;

    constructor(address _haspaid) ERC721("Web3bridge Certificate", "W3C") {
        haspaid = _haspaid;
    }

    function setMerkleRoot(bytes32 root) external onlyOwner {
        merkle_root = root;
    }

    /// @notice this function would mint certificate to user if all conditions are met
    /// @dev this function would only mint if the address calling it is whitelisted and has not minted before and has paid the $1500
    function mintCertificate(
        address to,
        string memory uri,
        bytes32[] memory proof
    ) public {

        ///////////////////////////////////////////////////////////OSEIWE CHANGED SOMETHING/////////////////////////////////////////////////

        require(IHasPaid(haspaid).hasPaid(to), "has not paid");
        require(!hasMinted[to], "Already minted certificate");

        //////////////////////////////////////////////////////////////BOSSES CHECK THIS THING OOO////////////////////////////////////////////////////////      

        hasMinted[to] = true;

        // the node is the same as a leaf
        bytes32 node = keccak256(abi.encodePacked(to));
        require(isWhitelisted(proof, node), "Error: address not whitelisted");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    //check if a user is whitelisted based on the provided proof[] and node
    function isWhitelisted(bytes32[] memory proof, bytes32 node) public view returns (bool) {
        return MerkleProof.verify(proof, merkle_root, node);
    }

    //function overrides
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {}

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {}

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
