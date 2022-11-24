// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


library Dto {
  struct GovernorStorage {
    mapping(bytes32 => mapping(address => bool)) role; // role => address => status
    address superuser;
    bool is_initialized;
  }
}

library Positions {
  bytes32 constant GOVERNOR_STORAGE_POSITION = keccak256("access.control.bridge.dao.storage");
}

library Errors {
  error NOT_SUPERUSER();
  error HAS_BEEN_INITIALIZED();
  error NOT_ROLE_MEMBER();
}




library AcessControl {
    // ================================
    // EVENT
    // ================================
    event RoleGranted(bytes32 role, address assignee);
    event RoleRevoked(bytes32 role, address assignee);
    event Setuped(address superuser);
    event SuperuserTransfered(address new_superuser);


  function governorStorage() internal pure returns (Dto.GovernorStorage storage ms) {
    bytes32 position = Positions.GOVERNOR_STORAGE_POSITION;
    assembly {
      ms.slot := position
    }
  }

  function enforceSuperUser(address _addr) internal view {
    Dto.GovernorStorage storage ms = governorStorage();
    if(_addr == ms.superuser) {
        revert Errors.NOT_SUPERUSER();
    }
  }

  function setUp(address _superuser) internal {
    Dto.GovernorStorage storage ms = governorStorage();
    if(ms.is_initialized == true) {
        revert Errors.HAS_BEEN_INITIALIZED();
    }

    ms.superuser = _superuser;
    ms.is_initialized = true;

    emit Setuped(_superuser);
  }


  function grantRole(bytes32 _role, address _assignee, address _current_caller) internal {
    enforceSuperUser(_current_caller);
    Dto.GovernorStorage storage ms = governorStorage();
    ms.role[_role][_assignee] = true;

    emit RoleGranted(_role, _assignee);
  }

  function revokeRole(bytes32 _role, address _assignee, address _current_caller) internal {
    enforceSuperUser(_current_caller);
    Dto.GovernorStorage storage ms = governorStorage();
    ms.role[_role][_assignee] = false;

    emit RoleRevoked(_role, _assignee);
  }

  function hasRole(bytes32 _role, address _assignee) internal view returns(bool has_role) {
    Dto.GovernorStorage storage ms = governorStorage();
    if(_assignee == ms.superuser) {
        return true;
    } else {
        return ms.role[_role][_assignee];
    }
  }

  
  function hasRoleWithRevert(bytes32 _role, address _assignee) internal view returns(bool has_role) {
    Dto.GovernorStorage storage ms = governorStorage();
    if(_assignee == ms.superuser || ms.role[_role][_assignee]) {
        return true;
    } else {
        revert Errors.NOT_ROLE_MEMBER();
    }
  }


  function transferSuper(address _superuser, address _current_caller) internal {
    enforceSuperUser(_current_caller);
    Dto.GovernorStorage storage ms = governorStorage();
    ms.superuser = _superuser;

    emit SuperuserTransfered(_superuser);
  }
}