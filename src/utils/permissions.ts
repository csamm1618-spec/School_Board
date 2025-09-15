// Simplified role system
export type Role = 'owner' | 'staff';

// Permission types based on your requirements
export type Permission = 
  // School Management (Owner only)
  | 'school:manage' | 'school:delete' | 'school:settings'
  // Staff Management (Owner only)
  | 'staff:manage' | 'staff:add' | 'staff:remove'
  // Student/Parent Management (Both roles)
  | 'students:view' | 'students:add' | 'students:edit' | 'students:delete'
  | 'parents:view' | 'parents:add' | 'parents:edit' | 'parents:delete'
  // SMS Management
  | 'sms:send' | 'sms:bulk'
  // Analytics
  | 'analytics:view'
  // Data Management
  | 'data:import' | 'data:export';

// Role-Permission mapping based on your specifications
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    // School Management - Full control
    'school:manage', 'school:delete', 'school:settings',
    // Staff Management - Can add/remove staff
    'staff:manage', 'staff:add', 'staff:remove',
    // Student/Parent Management - Full access
    'students:view', 'students:add', 'students:edit', 'students:delete',
    'parents:view', 'parents:add', 'parents:edit', 'parents:delete',
    // SMS - Full access
    'sms:send', 'sms:bulk',
    // Analytics - Full access
    'analytics:view',
    // Data Management - Full access
    'data:import', 'data:export'
  ],
  staff: [
    // Student/Parent Management - Limited access (no delete)
    'students:view', 'students:add', 'students:edit',
    'parents:view', 'parents:add', 'parents:edit',
    // SMS - Can send to assigned class/parents
    'sms:send',
    // Analytics - View their work analytics
    'analytics:view'
  ]
};

// Helper functions
export const hasPermission = (userRole: Role, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

export const hasAnyPermission = (userRole: Role, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

export const hasAllPermissions = (userRole: Role, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

// Role display names
export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  owner: 'Owner/Admin',
  staff: 'Staff'
};

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  owner: 'School owner/headmaster with full access to manage everything',
  staff: 'School staff with access to add/edit students and send SMS'
};

// Permission descriptions for UI
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  'school:manage': 'Manage school account and settings',
  'school:delete': 'Delete school account',
  'school:settings': 'Configure school settings and branding',
  'staff:manage': 'Manage staff members',
  'staff:add': 'Add new staff members',
  'staff:remove': 'Remove staff members',
  'students:view': 'View student information',
  'students:add': 'Add new students',
  'students:edit': 'Edit student details',
  'students:delete': 'Delete students',
  'parents:view': 'View parent information',
  'parents:add': 'Add new parents',
  'parents:edit': 'Edit parent details',
  'parents:delete': 'Delete parents',
  'sms:send': 'Send SMS messages',
  'sms:bulk': 'Send bulk SMS messages',
  'analytics:view': 'View analytics and reports',
  'data:import': 'Import data',
  'data:export': 'Export data'
};
