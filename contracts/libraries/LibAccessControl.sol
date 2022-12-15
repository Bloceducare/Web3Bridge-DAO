// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


library Dto {
  enum Roles {
    DEFAULT, // This is the role that all addresses has by default 
    DAO_GOVERNACE_MANAGER, // This role would be allowed to carryout governing action like creating proposal 
    ADMIN_OPERATOR, // This role would be able to call all the function in the admin ops facet
    CERTIFICATE_MANAGER, // This role owner would be able to deploy new certificate when a cohort graduate 
    TOKEN_FACTORY
  }
  struct AccessControlStorage {
    mapping(address => Roles) role; // address => role
    address superuser; // The superuser can preform all the role and assign role to addresses 
    bool is_initialized;
  }
}

library Positions {
  bytes32 constant ACCESS_CONTROL_STORAGE_POSITION = keccak256("access.control.bridge.dao.storage");
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
    event RoleGranted(Dto.Roles role, address assignee);
    event RoleRevoked(Dto.Roles role, address assignee);
    event Setuped(address superuser);
    event SuperuserTransfered(address new_superuser);


  function governorStorage() internal pure returns (Dto.AccessControlStorage storage ms) {
    bytes32 position = Positions.ACCESS_CONTROL_STORAGE_POSITION;
    assembly {
      ms.slot := position
    }
  }

  function enforceSuperUser(address _addr) internal view {
    Dto.AccessControlStorage storage ms = governorStorage();
    if(_addr == ms.superuser) {
        revert Errors.NOT_SUPERUSER();
    }
  }

  function setUp(address _superuser) internal {
    Dto.AccessControlStorage storage ms = governorStorage();
    if(ms.is_initialized == true) {
        revert Errors.HAS_BEEN_INITIALIZED();
    }

    ms.superuser = _superuser;
    ms.is_initialized = true;

    emit Setuped(_superuser);
  }


  function grantRole(address _assignee, Dto.Roles _role) internal {
    enforceSuperUser(msg.sender);
    Dto.AccessControlStorage storage ms = governorStorage();
    ms.role[_assignee] = _role;

    emit RoleGranted(_role, _assignee);
  }

  function revokeRole(Dto.Roles _role, address _assignee, address _current_caller) internal {
    enforceSuperUser(_current_caller);
    Dto.AccessControlStorage storage ms = governorStorage();
    ms.role[_assignee] = Dto.Roles.DEFAULT;

    emit RoleRevoked(_role, _assignee);
  }

  function hasRole(Dto.Roles _role, address _assignee) internal view returns(bool has_role) {
    Dto.AccessControlStorage storage ms = governorStorage();
    has_role = _role == ms.role[_assignee] || _assignee == ms.superuser;
  }

  
  function hasRoleWithRevert(Dto.Roles _role, address _assignee) internal view returns(bool has_role) {
    Dto.AccessControlStorage storage ms = governorStorage();
    if(_assignee == ms.superuser || ms.role[_assignee] == _role) {
        return true;
    } else {
        revert Errors.NOT_ROLE_MEMBER();
    }
  }


  function transferSuper(address _superuser, address _current_caller) internal {
    enforceSuperUser(_current_caller);
    Dto.AccessControlStorage storage ms = governorStorage();
    ms.superuser = _superuser;

    emit SuperuserTransfered(_superuser);
  }
}