// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;



library LibDiamond {
    bytes32 constant DIAMOND_STORAGE_POSITION = keccak256("certificate.diamond.standard.diamond.storage");


    struct DiamondStorage {
        address payment_token;
        mapping(address => bool) has_paid;
    }

    function diamondStorage() internal pure returns (DiamondStorage storage ds) {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }

    function setHasPaid(bool _status) internal {

    }

    function getHasPaid(bool _status) internal returns(bool paid) {

    }
}
