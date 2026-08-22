import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { AuthUser } from './types';
import { getEmployee } from './data/employees';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dayflow-super-secret-key-change-in-production-2024'
);

const COOKIE_NAME = 'dayflow-session';
const SESSION_COOKIE = 'dayflow_session';

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
 * Get the currently authenticated user from either mock session or JWT session.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  
  // 1. Check quick mock session cookie
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  if (sessionCookie?.value) {
    const employee = getEmployee(sessionCookie.value);
    if (employee) {
      return {
        employeeId: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        avatar: employee.avatar,
      };
    }
  }

  // 2. Check JWT session
  const jwtSession = await getSession();
  if (jwtSession) {
    const employee = getEmployee(jwtSession.employeeId);
    if (employee) {
      return {
        employeeId: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        avatar: employee.avatar,
      };
    }
    return {
      employeeId: jwtSession.employeeId,
      name: jwtSession.name,
      email: jwtSession.email,
      role: jwtSession.role.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE',
      avatar: '',
    };
  }

  return null;
}

/**
 * Require authentication. Redirects to login/signin if no session.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function setSession(employeeId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, employeeId, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(COOKIE_NAME);
}
