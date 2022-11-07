// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/LibAppStorage.sol";

contract GovernanceFacet {
    Proposal internal p;
    Voter internal v;
    Mappings internal mp;

    function createProposal(string memory _name, uint256 _endTime) external {

    }

    function cancelProposal(uint256 _proposalID) external{

    }

    function voteProposal(uint256 _proposalID) external{

    }

    function getVotes() public view returns(uint256[] memory){

    }

    function getProposals() public view returns(uint256[] memory){
        
    }
}