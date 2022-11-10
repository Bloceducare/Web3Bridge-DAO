// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;



interface IHasPaid {
    function hasPaid(address student) external returns(bool);
}