// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "../interfaces/IERC20.sol";
import {IERC721} from "../interfaces/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import {IAccessControl, Dto} from "../interfaces/IAccessControl.sol";


/// @title Web3DAO-Token Implmentartion Contract
/// @notice this contract will be called anytime a session is started and last thoroughout the duration of that session.
/// @author team Web3Bridge  💯

contract DAOtoken is IERC20 {

    // ===========================
    // CUSTOM ERROR
    // ===========================
    error NOT_DAIMOND();
    error ALREADY_INITIALIZIED();


    /**
     * ===================================================
     * ----------------- STATE VARIBLE -------------------
     * ===================================================
     */

    mapping(address => uint256) private _balances;

    uint256 _totalSupply;

    string private _name = "Web3bridge DAO TOKEN";
    string private _symbol = "WDT";

    uint256 private _mintAmountperPerson = 20;


    address public _diamond;

    IERC20 nftcetificate;

    bool private _enableMinting;

    bytes32 public merkle_root;

    bool isInitialized;

    /**
     * ===================================================
     * ----------------- MODIFIERS -----------------------
     * ===================================================
     */

    modifier onlyOwner() {
        require(IAccessControl(_diamond).hasRole(Dto.Roles.DAO_TOKEN_MANAGER, msg.sender), "not owner");
        _;
    }

    modifier onlyDiamond() {
        require(msg.sender == _diamond, "not diamond");
        _;
    }

    /**
     * ===================================================
     * ----------------- CONSTRUCTOR --------------------
     * ===================================================
     */


    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public pure returns (uint8) {
        return 18;
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    /// @notice this function is the function used to set the diamond address
    /// @dev this would update the diamond state variable (This functionality is not in the constructor because the daimond need the contract on deployment as does this contract)
    function init(address _addr) external {
        if(isInitialized) {
            revert ALREADY_INITIALIZIED();
        }
        _diamond = _addr;
        isInitialized = true;
    }


    /// @notice this function would be used for changing the diamond address should circumstance demand sure functionality 
    /// @dev only the an address with the admin role can make this call
    function setDiamondAddress(address _addr) external onlyOwner{
        _diamond = _addr;
    }

    /// @notice to change the merkleroot hash and can be called by onlyowner
    function setMerkleRoot(bytes32 root) external onlyOwner {
        merkle_root = root;
    }

    /// @notice this function sets the amount of tokens to mint to doa members 
    /// @dev this function should be accessable to only the admin
    /// @param newamount: this is the new amount of tokens to be minted to doa members (unit is wie)
    function setMintAmountPerPerson(uint256 newamount) public onlyOwner {
        require(newamount != 0, "cant zero for students");
        _mintAmountperPerson = newamount;
    }

    /// @notice return the amount to be minted to members
    function getMintperPerson() external view returns (uint256) {
        return _mintAmountperPerson;
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

    //the mint tokens to an address should have certificate nft before minting
    function _mint(bytes32[] memory proof) internal virtual {
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
        uint256 accountBalance = _balances[msg.sender];
        if(accountBalance > 0){
            _burn(msg.sender, accountBalance);
        }
        _mint(proof);
    }

    /// @dev the diamond would be able to burn users token during voting
    /// @notice this function would be used to burn DAO token from a percified user address
    /// @param _voter: this is the address that the burn would happen to
    /// @param _voting_power: this is the is the amount of power(token) this user is willing use for this vote
    function burn(address _voter, uint256 _voting_power) external onlyDiamond {
        _burn(_voter, _voting_power);
    }

    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");

        _beforeTokenTransfer(account, address(0), amount);

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
        }
        _totalSupply -= amount;

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}
}