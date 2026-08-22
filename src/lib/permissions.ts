// ============================================================
// Permissions & Role-based Access Control
// ============================================================

import type { Role, AuthUser } from './types';

// Permission constants
export const PERMISSIONS = {
  VIEW_OWN_PROFILE: 'VIEW_OWN_PROFILE',
  VIEW_ANY_PROFILE: 'VIEW_ANY_PROFILE',
  EDIT_OWN_PROFILE: 'EDIT_OWN_PROFILE',
  EDIT_ANY_PROFILE: 'EDIT_ANY_PROFILE',
  VIEW_OWN_SALARY: 'VIEW_OWN_SALARY',
  VIEW_ANY_SALARY: 'VIEW_ANY_SALARY',
  EDIT_SALARY: 'EDIT_SALARY',
  VIEW_SALARY_HISTORY: 'VIEW_SALARY_HISTORY',
  VIEW_EMPLOYEES: 'VIEW_EMPLOYEES',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Role → Permission mapping
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.VIEW_ANY_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
    PERMISSIONS.EDIT_ANY_PROFILE,
    PERMISSIONS.VIEW_OWN_SALARY,
    PERMISSIONS.VIEW_ANY_SALARY,
    PERMISSIONS.EDIT_SALARY,
    PERMISSIONS.VIEW_SALARY_HISTORY,
    PERMISSIONS.VIEW_EMPLOYEES,
  ],
  EMPLOYEE: [
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
    PERMISSIONS.VIEW_OWN_SALARY,
  ],
};

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Get all permissions for a role.
 */
export function getPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Check if the current user can access a specific employee's profile.
 */
export function canAccessProfile(
  currentUser: AuthUser,
  targetEmployeeId: string
): boolean {
  // Can always view own profile
  if (currentUser.employeeId === targetEmployeeId) return true;
  // Admin can view any profile
  return hasPermission(currentUser.role, PERMISSIONS.VIEW_ANY_PROFILE);
}

/**
 * Check if the current user can view a specific employee's salary.
 */
export function canViewSalary(
  currentUser: AuthUser,
  targetEmployeeId: string
): boolean {
  // Can always view own salary
  if (currentUser.employeeId === targetEmployeeId) return true;
  // Admin can view any salary
  return hasPermission(currentUser.role, PERMISSIONS.VIEW_ANY_SALARY);
}

/**
 * Check if the current user can edit salary configurations.
 */
export function canEditSalary(currentUser: AuthUser): boolean {
  return hasPermission(currentUser.role, PERMISSIONS.EDIT_SALARY);
}

/**
 * Check if the current user can view the employee directory.
 */
export function canViewEmployees(currentUser: AuthUser): boolean {
  return hasPermission(currentUser.role, PERMISSIONS.VIEW_EMPLOYEES);
}

/**
 * Check if the current user can edit a specific employee's profile.
 */
export function canEditProfile(
  currentUser: AuthUser,
  targetEmployeeId: string
): boolean {
  if (currentUser.employeeId === targetEmployeeId) {
    return hasPermission(currentUser.role, PERMISSIONS.EDIT_OWN_PROFILE);
  }
  return hasPermission(currentUser.role, PERMISSIONS.EDIT_ANY_PROFILE);
}
