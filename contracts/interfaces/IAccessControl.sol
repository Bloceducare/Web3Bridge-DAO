// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


interface IAccessControl {
    function setUp(address _superuser) external;
    function revokeRole(bytes32 _role, address _assignee) external;
    function hasRole(bytes32 _role, address _assignee) external view returns(bool isAdmin_);
    function transferSuper(address _superuser) external;
}