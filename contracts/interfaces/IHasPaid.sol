// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


interface IHasPaid {
    function checkCompleted(address _addr) external view returns (bool);
}