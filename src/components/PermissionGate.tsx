import React from 'react';
import { hasPermission, hasAnyPermission, hasAllPermissions, Permission, Role } from '../utils/permissions';

interface PermissionGateProps {
  children: React.ReactNode;
  userRole: Role;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // If true, requires ALL permissions; if false, requires ANY permission
  fallback?: React.ReactNode;
  showRestrictedMessage?: boolean;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  userRole,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  showRestrictedMessage = false
}) => {
  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(userRole, permission);
  } else if (permissions) {
    hasAccess = requireAll 
      ? hasAllPermissions(userRole, permissions)
      : hasAnyPermission(userRole, permissions);
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showRestrictedMessage) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-800 text-sm">
          You don't have permission to access this feature.
        </p>
      </div>
    );
  }

  return <>{fallback}</>;
};
