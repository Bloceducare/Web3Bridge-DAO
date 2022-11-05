// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

pragma solidity ^0.8.4;

contract Certificate is ERC721, ERC721URIStorage, Ownable {
    bytes32 merkle_root;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    mapping(address => bool) hasMinted;

    constructor() ERC721("Web3bridge Certificate", "W3C") {}

    function setMerkleRoot(bytes32 root) external onlyOwner {
        merkle_root = root;
    }

    function mintCertificate(
        address to,
        string memory uri,
        bytes32[] memory proof
    ) public {
        require(!hasMinted[to], "Already minted certificate");

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
