// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";


/// @title Web3DAO-Token Implmentartion Contract
/// @notice this contract will be called anytime a session is started and last thoroughout the duration of that session.
/// @author team Web3Bridge  💯

contract DAOtoken is ERC20("Web3bridge DAO TOKEN", "WDT") {
    /**
     * ===================================================
     * ----------------- STATE VARIBLE -------------------
     * ===================================================
     */

    uint256 private _mintAmountperPerson = 20;

    address private _owner;

    address public _diamond;

  

    bool private _enableMinting;

    bytes32 public merkle_root; 

    /**
     * ===================================================
     * ----------------- MODIFIERS -----------------------
     * ===================================================
     */

    modifier onlyOwner() {
        require(msg.sender == _owner, "not owner");
        _;
    }

    modifier onlyDiamond() {
        require(msg.sender == _diamond, "not owner");
        _;
    }

    /**
     * ===================================================
     * ----------------- CONSTRUCTOR --------------------
     * ===================================================
     */

    constructor() {
        _owner = msg.sender;
    }

    // to change the merkleroot hash and can be called by onlyowner
    function setMerkleRoot(bytes32 root) external onlyOwner {
        merkle_root = root;
    }

    //sets the amount to be minted for each members
    function setMintAmountPerPerson(uint256 newamount) public onlyOwner {
        require(newamount != 0, "cant zero for students");
        _mintAmountperPerson = newamount;
    }

    // return the amount to be minted to members
    function getMintperPerson() external view returns (uint256) {
        return _mintAmountperPerson;
    }

    //gets the owner of the contracts
    function getOwner() public view returns (address) {
        return _owner;
    }

    /// @notice sets the owner to a new one
    /// @dev NOTE this script must transfer ownership imedately after deployment
    function setNewOwner(address newOwner) public onlyOwner {
        require(newOwner != address(0), "zero address");
        _owner = newOwner;
    }

    /// @notice this function is the function used to set the diamond address
    /// @dev this would update the diamond state variable
    function setDiamondAddress(address _addr) external onlyOwner {
        _diamond = _addr;
    }

    /// @notice this fuction is used to get the state of minting
    /// this returns a bool (true or false)
    /// if state of minting is false, user can't mint token
    /// if true, users will be able to mint token
    function stateOfMinting() external view returns (bool) {
        return _enableMinting;
    }

    /// @notice this function is called by owner to enable minting every session 🤑
    function enableMinting(bool status) external onlyOwner {
        _enableMinting = status;
    }

    function transfer(address to, uint256 amount) public override returns (bool) {}

    function allowance(address owner, address spender) public view override returns (uint256) {}

    function approve(address spender, uint256 amount) public override returns (bool) {}

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {}

    //t
    function _mint(bytes32[] memory proof) internal {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        bool verified = MerkleProof.verify(proof, merkle_root, leaf);
        require(verified, "you are not included for minting");
        uint256 _amount = _mintAmountperPerson * 1e18;
        _totalSupply += _amount;
        _balances[msg.sender] += _amount;
        emit Transfer(address(0), msg.sender, _amount);

        _afterTokenTransfer(address(0), msg.sender, _amount);
    }

    function mint(bytes32[] memory proof) external {
        require(_enableMinting, "session has not ended");
        uint256 accountBalance = balanceOf(msg.sender);
        if(accountBalance > 0){
            _burn(msg.sender, accountBalance);
        }
        _mint(proof);
    }

    /// @dev the diamond would be able to burn users token during voting
    /// @notice this function would be used to burn DAO token from a percified user address
    /// @param _voter: this is the address that the burn would happen to
    /// @param _voting_power: this is the is the amount of power(token) this user is willing use for this vote
    function burn(address _voter, uint256 _voting_power) external {
        /// removed onlyOwner modifier to be revisited [please use onlyDiamond instead]
        _burn(_voter, _voting_power);
    }
}