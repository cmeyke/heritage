// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract Heritage is AccessControlEnumerable {
    bytes32 public constant APPOINTER_ROLE = keccak256("APPOINTER_ROLE");
    bytes32 public constant HEIR_ROLE = keccak256("HEIR_ROLE");
    uint256 public startTime;
    uint256 public timeAlive;

    constructor(address _heir, uint256 _timeAlive) payable {
        startTime = block.timestamp;
        timeAlive = _timeAlive;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(APPOINTER_ROLE, msg.sender);
        _grantRole(HEIR_ROLE, _heir);
    }

    modifier inheritanceIsClaimable() {
        require(block.timestamp > (startTime + timeAlive));
        _;
    }

    receive() external payable {}

    function executeTransaction(
        address _destination,
        uint256 _value,
        bytes memory _data
    ) external onlyRole(APPOINTER_ROLE) {
        (bool success, ) = _destination.call{value: _value}(_data);
        require(success);
    }

    function disinherit(address _heir) external onlyRole(APPOINTER_ROLE) {
        _revokeRole(HEIR_ROLE, _heir);
    }

    function inherit(address _heir) external onlyRole(APPOINTER_ROLE) {
        _grantRole(HEIR_ROLE, _heir);
    }

    function alive(uint256 _timeAlive) external onlyRole(APPOINTER_ROLE) {
        startTime = block.timestamp;
        if (_timeAlive > 0) {
            timeAlive = _timeAlive;
        }
    }

    function addAppointerAddress(address _appointer)
        external
        onlyRole(APPOINTER_ROLE)
    {
        _grantRole(APPOINTER_ROLE, _appointer);
        _grantRole(DEFAULT_ADMIN_ROLE, _appointer);
    }

    function removeAppointerAddress(address _appointer)
        external
        onlyRole(APPOINTER_ROLE)
    {
        require(msg.sender != _appointer);
        _revokeRole(APPOINTER_ROLE, _appointer);
        _revokeRole(DEFAULT_ADMIN_ROLE, _appointer);
    }

    function revokeAllAppointer(address _excludeAppointer) internal {
        revokeAllRoleMembers(APPOINTER_ROLE, _excludeAppointer);
        revokeAllRoleMembers(DEFAULT_ADMIN_ROLE, _excludeAppointer);
    }

    function revokeAllHeir() internal {
        revokeAllRoleMembers(HEIR_ROLE, address(0));
    }

    function revokeAllRoleMembers(bytes32 _role, address _excludeMember)
        internal
    {
        uint256 count = getRoleMemberCount(_role);
        for (uint256 i; i < count; i++) {
            address roleMember = getRoleMember(_role, i);
            if (roleMember != _excludeMember) {
                _revokeRole(_role, roleMember);
            }
        }
    }

    function acceptInheritance(bool reset)
        external
        onlyRole(HEIR_ROLE)
        inheritanceIsClaimable
    {
        if (reset) {
            revokeAllAppointer(address(0));
            revokeAllHeir();
        } else {
            _revokeRole(HEIR_ROLE, msg.sender);
        }
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(APPOINTER_ROLE, msg.sender);
    }

    function disinheritAll() external onlyRole(APPOINTER_ROLE) {
        revokeAllHeir();
    }

    function revokeAllOtherAppointer() external onlyRole(APPOINTER_ROLE) {
        revokeAllAppointer(msg.sender);
    }
}
