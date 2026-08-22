import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { AuthUser } from './types';
import { initDatabase, queryOne } from './db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dayflow-super-secret-key-change-in-production-2024'
);

const COOKIE_NAME = 'dayflow-session';

export interface SessionPayload {
  userId: number;
  employeeId: string;
  companyId: number;
  role: string;
  name: string;
  email: string;
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function getSessionCookieOptions(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  };
}

export function getLogoutCookieOptions() {
  return {
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };
}

/**
 * Get the currently authenticated user from JWT session + MySQL.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  if (!session) return null;

  try {
    await initDatabase();
    const employee = await queryOne<{
      id: number;
      employee_id: string;
      name: string;
      email: string;
      role: string;
      avatar: string;
      profile_picture: string;
      position: string;
      department: string;
      first_login: boolean;
      company_id: number;
    }>(
      'SELECT id, employee_id, name, email, role, avatar, profile_picture, position, department, first_login, company_id FROM employees WHERE id = ?',
      [session.userId]
    );

    if (employee) {
      // Only admin@dayflow.in or explicit admin accounts are ADMIN
      const isActualAdmin = employee.email === 'admin@dayflow.in' || employee.role.toLowerCase() === 'admin';
      const userRole = (employee.email !== 'admin@dayflow.in' && employee.role.toLowerCase() === 'admin') 
        ? 'EMPLOYEE' 
        : (employee.role.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE');

      return {
        employeeId: employee.employee_id,
        name: employee.name,
        email: employee.email,
        role: userRole,
        avatar: employee.profile_picture || employee.avatar || '',
        position: employee.position || '',
        department: employee.department || '',
        firstLogin: !!employee.first_login,
        companyId: employee.company_id,
      };
    }
  } catch (err) {
    console.error('getCurrentUser DB error:', err);
  }

  // Fallback to JWT data if DB fails
  const fallbackRole = (session.email !== 'admin@dayflow.in' && session.role.toLowerCase() === 'admin')
    ? 'EMPLOYEE'
    : (session.role.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE');

  return {
    employeeId: session.employeeId,
    name: session.name,
    email: session.email,
    role: fallbackRole,
    avatar: '',
    position: '',
    department: '',
    firstLogin: false,
    companyId: session.companyId,
  };
}

/**
 * Require authentication. Redirects to signin if no session.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/signin');
  }
  return user;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
