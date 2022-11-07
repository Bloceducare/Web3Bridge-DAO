// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/LibAppStorage.sol";
import "../interfaces/IDAOToken.sol";

contract GovernanceFacet {
    States internal states;

    function createProposal(string memory _name, uint256 _endTime) external {
        require(msg.sender == states.owner, "only owner");
        states.ID = states.ID + 1;
        Proposal storage newProposal = states.proposals[states.ID];

        newProposal.id = states.ID;
        newProposal.name = _name;
        newProposal.endTime = _endTime;
        newProposal.active = true;
        states.proposalCount += 1;
    }

    function cancelProposal(uint256 _proposalID) external {
        require(msg.sender == states.owner, "only owner");
        require(states.proposals[_proposalID].active == true, "proposal already cancelled");
        states.proposals[_proposalID].active = false;
    }

    function voteProposal(
        uint256 _proposalID,
        uint256 _voteType,
        uint256 voteWeight
    ) external {
        require(IDAOToken(states.daoToken).balanceOf(msg.sender) >= voteWeight, "insufficient token to vote");
        IDAOToken(states.daoToken).burn(msg.sender, voteWeight);

        if (_voteType == 1) {
            states.proposals[_proposalID].support += voteWeight;
        }

        if (_voteType == 0) {
            states.proposals[_proposalID].against += voteWeight;
        }

        states.proposals[_proposalID].voteCount += voteWeight;
        states.voted[msg.sender][_proposalID] = true;
    }

    function getProposals() public view returns (Proposal[] memory) {
        uint256 currentProposalIndex = 0;
        Proposal[] memory allProposals = new Proposal[](states.proposalCount);

        for (uint256 i = 0; i < states.proposalCount; i++) {
            uint256 currentID = i + 1;
            Proposal storage currentProposal = states.proposals[currentID];
            allProposals[currentProposalIndex] = currentProposal;
            currentProposalIndex += 1;
        }

        return allProposals;
    }

    function proposalCount() external view returns (uint256) {
        return states.proposalCount;
    }

    function getVotes() public view returns (uint256[] memory) {}
}
