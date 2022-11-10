// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HasPaid {
    mapping(address => bool) paid;

    address owner;
    address certificate;

    constructor(address _owner){
        owner = _owner;
    } 

    modifier onlyOwner(){
        require(msg.sender == owner, "not owner");
        _;
    }

    function setStateVariables(address _owner ,address _certificate) onlyOwner external {
        owner = _owner;
        certificate = _certificate;
    }

    function _hasPaid(address student) external onlyOwner returns(bool){
        paid[student] = true;
        return true;
    }

    function hasPaid(address student) view external returns(bool){
        return paid[student];
    }
}