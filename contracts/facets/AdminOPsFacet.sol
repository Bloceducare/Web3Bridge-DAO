// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {LibDiamond} from "../libraries/LibDiamond.sol";
import {IERC20} from "../interfaces/IERC20.sol";

/// @notice this contract would be handling admin opeations 
/// @dev this facet would be using the main diamond storage and the main LibDiaomnd for functio reuseabilty
contract AdminOpsFacet {
    /// @notice this function can be called by the admin to force pay even after the deadline 
    /// @dev this function would call a function in the pre_certificate token to set a user as paid
    function force_pay(address _addr) external {

    }

    /// @notice this force would mint pre certificate token to a user 
    /// @param _to: this is the address the token would be minted to 
    /// @dev this function would call the mint function in the pre_certificate token [This function would be guided with access control]
    function mint_pre_cert_token(address _to) external {

    }

    /// @notice this function is user by admin to blacklist and address
    /// @dev [This function would be guided with access control]
    /// @param _addr: this is the address that would be blacklisted 
    function blacklist_address(address _addr) external {

    }


    /// @notice this is a function that would be used to see if a user is blacklisted or not 
    /// @param _addr: this is the address to be checked if it is blacklisted
    function is_blacklisted(address _addr) external view {

    }


    /// @dev this function would move any ERC20 token that is transfered to this address
    /// @param _receiver: this is the address that would be receiving the tokens 
    /// @param _tokenContractAddress: this is the address of the erc 20 contract 
    /// @param _amount: this is the amount of token the manager want to get out of this contract
    function movingGeneric(address _receiver, address _tokenContractAddress, uint256 _amount) public {
        IERC20(_tokenContractAddress).transfer(_receiver, _amount); // this would transfer the token from the contract to the address
    }
}