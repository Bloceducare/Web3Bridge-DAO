// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

struct Proposal {
    uint256 id;
    string name;
    uint256 endTime;
    uint256 votersCount;
    uint256 voteCount;
    uint256 support;
    uint256 against;
    bool cancelled;
}

struct Vote {
    uint256 proposalID;
    address voter;
    uint256 weight;
}

struct States {
    address owner;
    mapping(uint256 => Proposal) proposals;
    mapping(address => mapping(uint256 => bool)) voted;
    mapping(uint256 => Vote) votes;
    uint256 ID;
    uint256 voteID;
    uint256 proposalCount;
    uint256 totalVoteCount;
    address daoToken;
}
