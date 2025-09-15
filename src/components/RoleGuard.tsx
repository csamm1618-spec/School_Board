import React from 'react';
import { Navigate } from 'react-router-dom';
import { Role, hasAnyPermission, Permission } from '../utils/permissions';

interface RoleGuardProps {
  children: React.ReactNode;
  userRole: Role;
  allowedRoles: Role[];
  requiredPermissions?: Permission[];
  fallbackPath?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  userRole,
  allowedRoles,
  requiredPermissions,
  fallbackPath = '/dashboard'
}) => {
  // Check if user role is allowed
  const hasRoleAccess = allowedRoles.includes(userRole);
  
  // Check if user has required permissions
  const hasPermissionAccess = requiredPermissions 
    ? hasAnyPermission(userRole, requiredPermissions)
    : true;

  if (!hasRoleAccess || !hasPermissionAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
