// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/LibAppStorage.sol";
import "../interfaces/IDAOToken.sol";

/// @dev this contract handles everything about Governance which entails
/// creating proposals by the admin, voting for proposals by the DAO members
contract GovernanceFacet {
    States internal states;

    /// @dev this function creates a proposal
    /// only owner of the contract can create proposals
    function createProposal(string memory _name, uint256 _endTime) external {
        require(msg.sender == states.owner, "only owner");
        require(_endTime > block.timestamp, "invalid end time");
        states.ID = states.ID + 1;
        Proposal storage newProposal = states.proposals[states.ID];

        newProposal.id = states.ID;
        newProposal.name = _name;
        newProposal.endTime = _endTime;
        states.proposalCount += 1;
    }

    /// @dev this function is used to cancel a proposal, given a proposalID
    /// only owner of the contract can create proposals
    function cancelProposal(uint256 _proposalID) external {
        require(msg.sender == states.owner, "only owner");
        require(states.proposals[_proposalID].cancelled == false, "proposal already cancelled");
        states.proposals[_proposalID].cancelled = true;
    }

    /// @dev this function returns all created proposals
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

    /// @dev this function returns the count(number) of total proposals created
    function proposalCount() external view returns (uint256) {
        return states.proposalCount;
    }

    /// @dev this function is used to vote for a proposal, given the proposalID
    /// it takes in a _voteType which can be 1 or 0 (one or zero):
    /// 1 is for a support vote, 0 is for an against vote
    /// it takes in a voteWeight which is equivalent to the number of votes a user is given
    /// users can only vote with a DAO token, and this token is burnt when user votes.
    /// the number of token burrnt is equivalent to the voteWeight a user used for voting.
    /// User can only vote once
    function voteProposal(
        uint256 _proposalID,
        uint256 _voteType,
        uint256 _voteWeight
    ) external {
        require(states.voted[msg.sender][_proposalID] == false, "already voted");
        require(IDAOToken(states.daoToken).balanceOf(msg.sender) >= _voteWeight, "insufficient DAO token to vote");
        require(states.proposals[_proposalID].cancelled == false, "proposal is cancelled");

        states.voteID = states.voteID + 1;

        IDAOToken(states.daoToken).burn(msg.sender, _voteWeight);

        if (_voteType == 1) {
            states.proposals[_proposalID].support += _voteWeight;
        }

        if (_voteType == 0) {
            states.proposals[_proposalID].against += _voteWeight;
        }

        states.proposals[_proposalID].voteCount += _voteWeight;
        states.proposals[_proposalID].votersCount += 1;
        states.voted[msg.sender][_proposalID] = true;

        Vote storage newVote = states.votes[states.voteID];
        newVote.proposalID = _proposalID;
        newVote.voter = msg.sender;
        newVote.weight = _voteWeight;
        states.totalVoteCount += 1;
    }

    /// @dev this function returns all the voter for a particular proposal given the proposalID
    function getVoters(uint256 _proposalID) public view returns (Vote[] memory) {
        uint256 currentVoterIndex = 0;
        uint256 votesCount = states.totalVoteCount;
        uint256 proposalVotersCount = 0;

        for (uint256 i = 0; i < votesCount; i++) {
            if (states.votes[i + 1].proposalID == _proposalID) {
                proposalVotersCount += 1;
            }
        }

        Vote[] memory allVoters = new Vote[](proposalVotersCount);

        for (uint256 i = 0; i < votesCount; i++) {
            if (states.votes[i + 1].proposalID == _proposalID) {
                uint256 currentID = i + 1;

                Vote storage currentVoter = states.votes[currentID];

                allVoters[currentVoterIndex] = currentVoter;
                currentVoterIndex += 1;
            }
        }

        return allVoters;
    }
}
