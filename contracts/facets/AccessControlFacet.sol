// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {AcessControl, Dto} from "../libraries/LibAccessControl.sol";

/// @notice this contract would be handling access control matter for the web3bridge dao ecosystem
contract AccessControl {
    /// @notice this function would be used for initializing the superuser
    /// @dev this function can only called once
    /// @param _superuser: this is the address of the would be superuser
    function setUp(address _superuser) external {
        AcessControl.setUp(_superuser);
    }

    /// @notice this function would be used to grant role to an account
    /// @dev [this is would be guided by this assess control] (and this access control has been implemented in the provider)
    /// @param _role: this is the role this is to be assigned to the address (keccak256("NAME_OF_ROLE"))
    /// @param _assignee: this is the address the role would be assigned to
    function grantRole(Dto.Roles _role, address _assignee) external {
        AcessControl.grantRole(_assignee, _role);
    }

    /// @notice this function would be used by the superuser to revoke role given to an address
    /// @dev during this process, this function would be gated in that only the superuser can make this call
    function revokeRole(Dto.Roles _role, address _assignee) external {
        AcessControl.revokeRole(_role, _assignee);
    }

    /// @notice this function is a view that would be used to check if an address has a role
    /// @dev this function would not be guided
    /// @param _role: this is the role that is to be assigned to the address (keccak256("NAME_OF_ROLE"))
    /// @param _assignee: this is the address the role would be assigned to
    function hasRole(Dto.Roles _role, address _assignee) external view returns (bool isAdmin_) {
        isAdmin_ = AcessControl.hasRole(_role, _assignee);
    }

    /// @notice this function would be used to transfer superuser ownership to different account
    /// @dev only superuser can make this change
    /// @param _superuser: this is the address of the would be superuser
    function transferSuper(address _superuser) external {
        AcessControl.transferSuper(_superuser, msg.sender);
    }
}

