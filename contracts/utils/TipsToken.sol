// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @dev this contract is the tips token contract which will be minted to cohort students
/// which they use to tip mentors when they receive help from these mentors
contract TipsToken is ERC20 {
    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        address _owner
    ) ERC20(_tokenName, _tokenSymbol) {
        owner = _owner;
        tokenName = _tokenName;
        tokenSymbol = _tokenSymbol;
    }

    bytes32 public merkleRoot;
    address owner;
    string tokenName;
    string tokenSymbol;
    uint216 NumOfTokensToMint;
    mapping(address => bool) public studentClaimed;

    function whitelistMint(bytes32[] calldata _merkleProof) internal view returns (bool status) {
        require(!studentClaimed[msg.sender], "Address already claimed");
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProof.verify(_merkleProof, merkleRoot, leaf), "Invalid Merkle Proof.");
        status = true;
    }

    function mintToken(bytes32[] calldata _merkleProof) public {
        bool stat = whitelistMint(_merkleProof);
        require(stat, "Invaild Proof");
        _mint(msg.sender, NumOfTokensToMint);
        studentClaimed[msg.sender] = true;
    }

    function changeHashRoot(bytes32 _merkleRoot) external {
        assert(msg.sender == owner);
        merkleRoot = _merkleRoot;
    }

    function setNumberOfTokensToMint(uint216 _NumOfTokensTMint) external {
        assert(msg.sender == owner);
        NumOfTokensToMint = _NumOfTokensTMint;
    }

    function returnMerkelRoot() external view returns( bytes32 root) {
        root = merkleRoot;
    }

    function returnNumOftoken() external view returns(uint216 tobeMinted) {
        tobeMinted = NumOfTokensToMint;
    }

    function name() public view virtual override returns (string memory) {
        return tokenName;
    }

    function symbol() public view virtual override returns (string memory) {
        return tokenSymbol;
    }
}
