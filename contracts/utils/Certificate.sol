// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {IHasPaid} from "../interfaces/IHasPaid.sol";
import {IAccessControl, Dto} from "../interfaces/IAccessControl.sol";

contract Certificate is ERC721, ERC721URIStorage {
    bytes32 public merkle_root; // store the merkle root hash
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    mapping(address => bool) hasMinted;
    address public pre_cert_token; // used to see if a user has paid cohort fee be mint certificate to them
    address public diamond;
    string public URI;

    // ======================
    // ERROR
    // ======================

    error NOT_ADMIN();
    error TRANSFER_NOT_ALLOWED();
    error BURN_NOT_SUCCESSFUL();

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _URI,
        address _pre_cerificate_token,
        address _diamond
    ) ERC721(_name, _symbol) {
        pre_cert_token = _pre_cerificate_token;
        diamond = _diamond;
        URI = _URI;
    }

    /// @notice this function would be setting the merkle root need for validation
    /// @dev this should be set before normal interaction
    function setMerkleRoot(bytes32 root) external {
        if (IAccessControl(diamond).hasRole(Dto.Roles.CERTIFICATE_MANAGER, msg.sender)) {
            merkle_root = root;
        } else {
            revert NOT_ADMIN();
        }
    }

    /// @notice this function would mint certificate to user if all conditions are met
    /// @dev this function would only mint if the address calling it is whitelisted and has not minted before and has paid the $1500
    function mintCertificate(bytes32[] memory proof) public {
        require(!hasMinted[msg.sender], "Already minted certificate");
        require(IHasPaid(pre_cert_token).checkCompleted(msg.sender), "Has not paid");

        hasMinted[msg.sender] = true;

        // the node is the same as a leaf
        bytes32 node = keccak256(abi.encodePacked(msg.sender));
        require(isWhitelisted(proof, node), "Error: address not whitelisted");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, URI);
    }

    //check if a user is whitelisted based on the provided proof[] and node
    function isWhitelisted(bytes32[] memory proof, bytes32 node) public view returns (bool) {
        return MerkleProof.verify(proof, merkle_root, node);
    }

    //@notice function to change the NFT certificate URI
    //@dev can only be called by the certificate manager from the diamond
    function changeCertificateURI(string memory _newURI) external {
        if (IAccessControl(diamond).hasRole(Dto.Roles.CERTIFICATE_MANAGER, msg.sender)) {
            URI = _newURI;
        } else {
            revert NOT_ADMIN();
        }
    }

    //function overrides
    function transferFrom(address from, address to, uint256 tokenId) public pure virtual override {
        revert TRANSFER_NOT_ALLOWED();
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public pure virtual override {
        revert TRANSFER_NOT_ALLOWED();
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public virtual override {
        revert TRANSFER_NOT_ALLOWED();
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        revert BURN_NOT_SUCCESSFUL();
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
