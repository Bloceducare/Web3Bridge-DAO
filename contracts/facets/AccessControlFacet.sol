// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {AcessControl} from "../libraries/LibAccessControl.sol";



/// @notice this contract would be handling access control matter for the web3bridge doa ecosystem
contract AccessControl {
/// @notice this function would be used for initilizing the superuser 
    /// @dev this function can only called once 
    /// @param _superuser: this is the address of the would be superuser 
    function setUp(address _superuser) external {
        AcessControl.setUp(_superuser);
    }

    /// @notice 
    /// @dev [this is would be guided by this assess control]
    /// @param _role: this is the role this is to be assigned to the address (keccak256("NAME_OF_ROLE"))
    /// @param _assignee: this is the address the role would be assigned to 
    function grantRole(bytes32 _role, address _assignee) external {
        AcessControl.grantRole(_role, _assignee, msg.sender);
    }

    /// @notice this function would be used by the superuser to revoke role given to and address 
    /// @dev during this process, this function would be gated in that only yhe superuser can make this call
    function revokeRole(bytes32 _role, address _assignee) external {
        AcessControl.revokeRole(_role, _assignee, msg.sender);
    }

    /// @notice this function is a view that would be used to check if an address has a role 
    /// @dev this function would not be guided 
    /// @param _role: this is the role this is to be assigned to the address (keccak256("NAME_OF_ROLE"))
    /// @param _assignee: this is the address the role would be assigned to 
    function hasRole(bytes32 _role, address _assignee) external view returns(bool isAdmin_) {
        isAdmin_ = AcessControl.hasRole(_role, _assignee);
    }

    /// @notice this function would be used to transfer superuser ownership to different account 
    /// @dev only superuser can make this change 
    /// @param _superuser: this is the address of the would be superuser 
    function transferSuper(address _superuser) external {
        AcessControl.transferSuper(_superuser, msg.sender);
    }
}


// role: bytes32(abi.encodePacked(keccak256("PRE_CERTIFICATE_TOKEN_MANAGER")))