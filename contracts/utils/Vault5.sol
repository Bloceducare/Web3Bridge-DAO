 
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import { IERC20 } from "../interfaces/IERC20.sol";

/// @title Vault5 Contract
/// @author https://github.com/Ultra-Tech-code, https://github.com/Adebara123
/// The Vault5 contract is used as a reward token disbursing contract for past cohort interns
/// The admin will open the vault(set withdrawTimeReached to true) for withdrawal
contract Vault5 {
    /// @param _tokenContract: this would be the address of the token that will be disbursed.
    /// @param _admin: this is the address that would be handling the admin operations
    constructor (address _tokenContract, address _admin ) {
        tokenContract = IERC20(_tokenContract);
        admin = _admin;
    }

    // ===========================
    // STATE VARIABLE
    // ===========================
    bool withdrawTimeReached;
    uint216 amountDepositedForSharing;
    uint8 numberOfPaidUsers;
    address admin;
    IERC20 tokenContract;

    struct earlyPayment {
        address earlyPayers;
        bool withdrawn;
    }

    mapping (address => earlyPayment) EarlyPayers;

    // ===========================
    // EVENTS
    // ===========================
    event NewDeposit(uint216 indexed amount);
    event NewWithdrawal(address indexed account, uint216 share);
    event NewPaidUser(address indexed user, uint8 number);

    /// @dev A function to deposit into the vault
    function depositIntoVault (uint216 _amount) external {
        amountDepositedForSharing += _amount;
        IERC20(tokenContract).transferFrom(msg.sender, address(this), _amount);

         // emit a log event when a deposit is made
        emit NewDeposit(_amount);
    }

    function addAddressOfEarlyPayment () external {
        numberOfPaidUsers+1;
        earlyPayment storage EP = EarlyPayers[msg.sender];
        EP.earlyPayers = msg.sender;

        // emit a log event when a new payee is added
        emit NewPaidUser(msg.sender, numberOfPaidUsers);
    }

<<<<<<< HEAD
    /// @dev A function to withdraw share
    function withdrawShare () external {
        require(withdrawTimeReached == true, "Vault not open");
=======
    function withdrawShare () external {
>>>>>>> 23fb63b9b26adcbab2efa2350dff0ff24c864afe
        earlyPayment storage EP = EarlyPayers[msg.sender];
        assert(EP.withdrawn == false);
        uint216 share = individualShare();
        amountDepositedForSharing -= share;
        EP.withdrawn = true;
        IERC20(tokenContract).transfer(msg.sender, share);
<<<<<<< HEAD
        numberOfPaidUsers-1;
=======
        numberOfPaidUsers--;
>>>>>>> 23fb63b9b26adcbab2efa2350dff0ff24c864afe

        // emit a log event when a new withdrawal is made
        emit NewWithdrawal(msg.sender, share);
    }

    /// @dev A function to calculate individual share
    function individualShare () private view returns (uint216 share){
        share = amountDepositedForSharing / numberOfPaidUsers;
    }

    /// @dev A function to open the vault for withdrawal
    /// @notice this function can only be called by the admin
    function openVault () public {
        assert(msg.sender == admin);
        withdrawTimeReached = true;
    }

<<<<<<< HEAD
    /// @dev A view function to return the balance of the vault
    function returnVaultBalace() public view returns(uint216 vaultBalance) {
        vaultBalance = amountDepositedForSharing;
    }

    /// @dev A view function to return the status of withdrawTimeReached
    function checkIfWithdrawTimeReached () public view returns(bool open) {
        open = withdrawTimeReached;
    }
}
=======
       function returnVaultBalace() public view returns(uint216 vaultBalance) {
        vaultBalance = amountDepositedForSharing;
    }

    function checkIfWithdrawTimeReached () public view returns(bool open) {
        open = withdrawTimeReached;
    }
}
>>>>>>> 23fb63b9b26adcbab2efa2350dff0ff24c864afe
