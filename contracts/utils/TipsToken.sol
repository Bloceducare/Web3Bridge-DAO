// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {IAccessControl, Dto} from "../interfaces/IAccessControl.sol";

/// @dev this contract is the tips token contract which will be minted to cohort students
/// which they use to tip mentors when they receive help from these mentors
contract TipsToken is ERC20 {
    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        address _diamond
    ) ERC20(_tokenName, _tokenSymbol) {
       diamond = _diamond;
        tokenName = _tokenName;
        tokenSymbol = _tokenSymbol;
    }

    bytes32 public merkleRoot;
    address diamond;
    string tokenName;
    string tokenSymbol;
    uint216 NumOfTokensToMint;
    mapping(address => bool) public studentClaimed;
    mapping(address => uint) public tipsSent;
    mapping(address => uint) public tipsRceived; 

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
          assert(IAccessControl(diamond).hasRole(Dto.Roles.TOKEN_FACTORY, msg.sender));
        merkleRoot = _merkleRoot;
    }

    function setNumberOfTokensToMint(uint216 _NumOfTokensTMint) external {
       assert(IAccessControl(diamond).hasRole(Dto.Roles.TOKEN_FACTORY, msg.sender));
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

    function tipsTokenSent(address _addr) external view returns(uint sent) {
        sent = tipsSent[_addr];
    }

    function tipsTokenRecieved (address _addr) external view returns(uint received) {
        received = tipsRceived[_addr];
    }

    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        tipsRceived[to] += amount;
        tipsSent[owner] += amount;
        return true;
    }

     function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        tipsRceived[to] += amount;
        tipsSent[from] += amount;
        return true;
    }


}
