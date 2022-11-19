// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {IHasPaid} from "../interfaces/IHasPaid.sol";

contract Certificate is ERC721, ERC721URIStorage, Ownable {
    bytes32 public merkle_root; // store the merkle root hash
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    mapping(address => bool) hasMinted;
    address pre_cert_token; // used to see if a user has paid cohort fee be mint certificate to them

    constructor(
        string memory _name,
        string memory _symbol,
        address _pre_cerificate_token
    ) ERC721(_name, _symbol) {
        pre_cert_token = _pre_cerificate_token;
    }

    function setMerkleRoot(bytes32 root) external onlyOwner {
        merkle_root = root;
    }

    /// @notice this function would mint certificate to user if all conditions are met
    /// @dev this function would only mint if the address calling it is whitelisted and has not minted before and has paid the $1500
    function mintCertificate(string memory uri, bytes32[] memory proof) public {
        require(!hasMinted[msg.sender], "Already minted certificate");
        require(IHasPaid(pre_cert_token).checkCompleted(msg.sender), "Has not paid");

        hasMinted[msg.sender] = true;

        // the node is the same as a leaf
        bytes32 node = keccak256(abi.encodePacked(msg.sender));
        require(isWhitelisted(proof, node), "Error: address not whitelisted");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
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

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {}

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual override {}

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {}

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
