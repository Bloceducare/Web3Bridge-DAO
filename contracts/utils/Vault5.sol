// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import { IERC20 } from "../interfaces/IERC20.sol";

contract Vault5 {
    constructor (address _tokenContract, address _owner ) {
        tokenContract = IERC20(_tokenContract);
        owner = _owner;
    }

    bool withdrawTimeReached;
    uint216 amountDepositedForSharing;
    uint8 numberOfPaidUsers;
    address owner;
    IERC20 tokenContract;
    
    struct earlyPayment {
        address earlyPayers;
        bool withdrawn;
    }

    mapping (address => earlyPayment) EarlyPayers;

    event NewDeposit(uint216 indexed amount);
    event NewWithdrawal(address indexed account, uint216 share);
    event NewPaidUser(address indexed user, uint8 number);

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

    function withdrawShare (address _addr) external {
        earlyPayment storage EP = EarlyPayers[msg.sender];
        assert(EP.withdrawn == false);
        uint216 share = individualShare();
        amountDepositedForSharing -= share;
        EP.withdrawn = true;
        IERC20(tokenContract).transfer(_addr, share);
        numberOfPaidUsers--;

        // emit a log event when a new withdrawal is made
        emit NewWithdrawal(msg.sender, share);
    }

    function individualShare () private view returns (uint216 share){
        share = amountDepositedForSharing / numberOfPaidUsers;
    }

    function openVault () public {
        assert(msg.sender == owner);
        withdrawTimeReached = true;
    }
}