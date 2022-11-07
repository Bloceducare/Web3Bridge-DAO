// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

struct Proposal {
    string name;
    uint256 endTime;
    uint256 voteCount;
    uint256 support;
    uint256 against;
}

struct Voter {
    uint256 weight;
    bool voted;
    uint256 proposalVoted;
}

struct Mappings {
    mapping(uint256 => Proposal) proposals;
    mapping(address => mapping(uint256 => bool)) voted;
    mapping(uint256 => Voter) proposalVoters;
}
