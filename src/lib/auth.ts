// ============================================================
// Mock Authentication Layer (Cookie-based session)
// ============================================================

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { AuthUser } from './types';
import { getEmployee } from './data/employees';

const SESSION_COOKIE = 'dayflow_session';

/**
 * Get the currently authenticated user from the session cookie.
 * Returns null if no session exists.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);

  if (!sessionCookie?.value) return null;

  const employee = getEmployee(sessionCookie.value);
  if (!employee) return null;

  return {
    employeeId: employee.id,
    name: employee.name,
    email: employee.email,
    role: employee.role,
    avatar: employee.avatar,
  };
}

/**
 * Require authentication. Redirects to login if no session.
 * Returns the authenticated user.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

/**
 * Set the session cookie for the given employee ID.
 * Must be called from a Server Action or Route Handler.
 */
export async function setSession(employeeId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, employeeId, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
  });
}

/**
 * Clear the session cookie.
 * Must be called from a Server Action or Route Handler.
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
