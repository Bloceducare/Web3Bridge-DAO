// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IERC20.sol";



/// @title Pre-Certificate Token
/// The Pre-Certifcate Token contract is used as a proof of payment
/// Students that paid the required amount can mint
/// Student can pay installmentally
/// The mode of payment can either be in USDT or MATIC
/// The admin will set the fee to be paid by students

contract PreCertificateToken {
    // Custom errors
    error notAdmin(string);

    /*   State variable   */
    bytes32 public merkleRoot;
    IERC20 public USDTContractAddr;
    uint40 public cohortFee;
    address public admin;



    constructor(address _admin){
        admin = _admin;
    }

/// @notice this function can only be called by the admin
    function setFee(uint40 _amount, bytes32 _merkleRoot, IERC20 _USDTContractAddr) public {
        if(msg.sender == admin){
            cohortFee = _amount;
            merkleRoot = _merkleRoot;
            USDTContractAddr = _USDTContractAddr;
        }
        else{
            revert notAdmin("Not an Admin");
        }
    }




}