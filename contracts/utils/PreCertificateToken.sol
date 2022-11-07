// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/// @title Pre-Certificate Token
/// @author https://github.com/Realkayzee, https://github.com/fesimaxu, https://github.com/centie22
/// The Pre-Certifcate Token contract is used as a proof of payment
/// Students that paid the required amount can mint
/// Student can pay installmentally
/// The mode of payment can either be in USDT or MATIC
/// The admin will set the fee to be paid by students

contract PreCertificateToken is ERC20("Pre-Certificate Token", "WPC") {
    // Custom errors
    error notAdmin(string);
    error notCompleted(string);

    /*   Events */

    /*   State variable   */
    bytes32 public merkleRoot;
    IERC20 public USDTContractAddr;
    uint256 public cohortFee;
    address public admin;
    uint40 paymentStart;
    uint40 elapsedTime;
    uint40 additionalTime;

    struct StudentDetails {
        uint256 amountPaid;
        bool claimed;
        uint8 tokenRecieved;
        uint40 timeOfLastPayment;
    }

    mapping(address => StudentDetails) studentDetails;

    constructor(address _admin) {
        admin = _admin;
    }

    /// @notice this function can only be called by the admin
    function setFee(
        uint40 _amount,
        bytes32 _merkleRoot,
        IERC20 _USDTContractAddr,
        uint40 _elapsedTime,
        uint40 _additionalTime
    ) public {
        if (msg.sender == admin) {
            cohortFee = _amount;
            merkleRoot = _merkleRoot;
            USDTContractAddr = _USDTContractAddr;
            paymentStart = block.timestamp;
            elapsedTime = block.timestamp + (_elapsedTime * 4 weeks);
            additionalTime = block.timestamp + (_additionalTime * 4 weeks);
        } else {
            revert notAdmin("Not an Admin");
        }
    }

    /// @dev A function for student's payment
    /// @notice A seperate function is created for fee payment in other allow installmental payment
    function payFee(uint40 _stableAmount, bytes32 memory _merkleProof) public {
        StudentDetails storage sd = studentDetails[msg.sender];
        bytes32 leaf = keccak256(msg.sender);
        if (MerkleProof.verify(_merkleProof, merkleRoot, leaf) && block.timestamp < additionalTime) {
            // assert(_stableAmount >= (cohortFee * 70)/100) ;
            USDTContractAddr.transferFrom(msg.sender, address(this), _stableAmount);
            sd.amountPaid += _stableAmount;
            sd.timeOfLastPayment = block.timestamp;
        } else if (block.timestamp > additionalTime && sd.amountPaid < cohortFee) {
            uint256 amount = sd.amountPaid;
            sd.amountPaid = 0;
            USDTContractAddr.transfer(msg.sender, amount);
        }
    }

    function checkCompleted() public view returns (bool) {
        StudentDetails memory sd = studentDetails[msg.sender];
        if (sd.amountPaid == cohortFee) {
            return true;
        } else {
            revert notCompleted("Payment not completed");
        }
    }

    function claimToken(bytes32 memory _merkleProof) public {
        StudentDetails storage sd = studentDetails[msg.sender];
        bytes32 leaf = keccak256(msg.sender);
        if (MerkleProof.verify(_merkleProof, merkleRoot, leaf)) {
            assert(checkCompleted());
            assert(!sd.claimed);
            if (sd.timeOfLastPayment < elapsedTime) {
                _mint(msg.sender, 2);
                sd.tokenRecieved = 2;
            } else if (sd.timeOfLastPayment > elapsedTime) {
                _mint(msg.sender, 1);
                sd.tokenReceived = 1;
            }
        }

        sd.claimed = true;
    }
}
