// ============================================================
// Permissions & Role-based Access Control
// ============================================================

import type { Role, AuthUser } from './types';

// Permission constants
export const PERMISSIONS = {
  // Profile
  VIEW_OWN_PROFILE: 'VIEW_OWN_PROFILE',
  VIEW_ANY_PROFILE: 'VIEW_ANY_PROFILE',
  EDIT_OWN_PROFILE: 'EDIT_OWN_PROFILE',
  EDIT_ANY_PROFILE: 'EDIT_ANY_PROFILE',
  // Salary
  VIEW_OWN_SALARY: 'VIEW_OWN_SALARY',
  VIEW_ANY_SALARY: 'VIEW_ANY_SALARY',
  EDIT_SALARY: 'EDIT_SALARY',
  VIEW_SALARY_HISTORY: 'VIEW_SALARY_HISTORY',
  // Employees
  VIEW_EMPLOYEES: 'VIEW_EMPLOYEES',
  // Attendance
  VIEW_OWN_ATTENDANCE: 'VIEW_OWN_ATTENDANCE',
  VIEW_ANY_ATTENDANCE: 'VIEW_ANY_ATTENDANCE',
  CHECK_IN: 'CHECK_IN',
  CHECK_OUT: 'CHECK_OUT',
  MANAGE_ATTENDANCE: 'MANAGE_ATTENDANCE',
  // Time Off
  VIEW_OWN_TIME_OFF: 'VIEW_OWN_TIME_OFF',
  CREATE_TIME_OFF: 'CREATE_TIME_OFF',
  VIEW_ANY_TIME_OFF: 'VIEW_ANY_TIME_OFF',
  APPROVE_TIME_OFF: 'APPROVE_TIME_OFF',
  REJECT_TIME_OFF: 'REJECT_TIME_OFF',
  MANAGE_TIME_OFF: 'MANAGE_TIME_OFF',
  MANAGE_TIME_OFF_ALLOCATIONS: 'MANAGE_TIME_OFF_ALLOCATIONS',
  // Networks
  MANAGE_NETWORKS: 'MANAGE_NETWORKS',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Role → Permission mapping
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    // Profile
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.VIEW_ANY_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
    PERMISSIONS.EDIT_ANY_PROFILE,
    // Salary
    PERMISSIONS.VIEW_OWN_SALARY,
    PERMISSIONS.VIEW_ANY_SALARY,
    PERMISSIONS.EDIT_SALARY,
    PERMISSIONS.VIEW_SALARY_HISTORY,
    // Employees
    PERMISSIONS.VIEW_EMPLOYEES,
    // Attendance
    PERMISSIONS.VIEW_OWN_ATTENDANCE,
    PERMISSIONS.VIEW_ANY_ATTENDANCE,
    PERMISSIONS.CHECK_IN,
    PERMISSIONS.CHECK_OUT,
    PERMISSIONS.MANAGE_ATTENDANCE,
    // Time Off
    PERMISSIONS.VIEW_OWN_TIME_OFF,
    PERMISSIONS.CREATE_TIME_OFF,
    PERMISSIONS.VIEW_ANY_TIME_OFF,
    PERMISSIONS.APPROVE_TIME_OFF,
    PERMISSIONS.REJECT_TIME_OFF,
    PERMISSIONS.MANAGE_TIME_OFF,
    PERMISSIONS.MANAGE_TIME_OFF_ALLOCATIONS,
    // Networks
    PERMISSIONS.MANAGE_NETWORKS,
  ],
  EMPLOYEE: [
    // Profile
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
    // Salary
    PERMISSIONS.VIEW_OWN_SALARY,
    PERMISSIONS.VIEW_EMPLOYEES,
    // Attendance
    PERMISSIONS.VIEW_OWN_ATTENDANCE,
    PERMISSIONS.CHECK_IN,
    PERMISSIONS.CHECK_OUT,
    // Time Off
    PERMISSIONS.VIEW_OWN_TIME_OFF,
    PERMISSIONS.CREATE_TIME_OFF,
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
  if (currentUser.employeeId === targetEmployeeId) return true;
  return hasPermission(currentUser.role, PERMISSIONS.VIEW_ANY_PROFILE);
}

/**
 * Check if the current user can view a specific employee's salary.
 */
export function canViewSalary(
  currentUser: AuthUser,
  targetEmployeeId: string
): boolean {
  if (currentUser.employeeId === targetEmployeeId) return true;
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

// ============================================================
// Attendance Permission Helpers
// ============================================================

/**
 * Check if the current user can view a specific employee's attendance.
 */
export function canViewAttendance(
  currentUser: AuthUser,
  targetEmployeeId: string
): boolean {
  if (currentUser.employeeId === targetEmployeeId) return true;
  return hasPermission(currentUser.role, PERMISSIONS.VIEW_ANY_ATTENDANCE);
}

/**
 * Check if the current user can manage attendance (admin operations).
 */
export function canManageAttendance(currentUser: AuthUser): boolean {
  return hasPermission(currentUser.role, PERMISSIONS.MANAGE_ATTENDANCE);
}

/**
 * Check if the current user can manage company networks.
 */
export function canManageNetworks(currentUser: AuthUser): boolean {
  return hasPermission(currentUser.role, PERMISSIONS.MANAGE_NETWORKS);
}

// ============================================================
// Time Off Permission Helpers
// ============================================================

/**
 * Check if the current user can view a specific employee's time off.
 */
export function canViewTimeOff(
  currentUser: AuthUser,
  targetEmployeeId: string
): boolean {
  if (currentUser.employeeId === targetEmployeeId) return true;
  return hasPermission(currentUser.role, PERMISSIONS.VIEW_ANY_TIME_OFF);
}

/**
 * Check if the current user can approve/reject time off requests.
 */
export function canApproveTimeOff(currentUser: AuthUser): boolean {
  return hasPermission(currentUser.role, PERMISSIONS.APPROVE_TIME_OFF);
}

/**
 * Check if the current user can manage time-off allocations.
 */
export function canManageAllocations(currentUser: AuthUser): boolean {
  return hasPermission(currentUser.role, PERMISSIONS.MANAGE_TIME_OFF_ALLOCATIONS);
}

/**
 * Check if the current user can manage time-off types.
 */
export function canManageTimeOffTypes(currentUser: AuthUser): boolean {
  return hasPermission(currentUser.role, PERMISSIONS.MANAGE_TIME_OFF);
}

