import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Proxy (replaces deprecated middleware.ts)
 * Protects dashboard routes — redirects unauthenticated users to /signin.
 */
export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('dayflow-session');
  const { pathname } = request.nextUrl;
  console.log(`[PROXY] ${request.method} ${pathname} | Cookie present: ${!!sessionCookie?.value}`);

  const isPublicPath =
    pathname === '/signin' ||
    pathname === '/signup' ||
    pathname === '/login' ||
    pathname.startsWith('/api/auth');

  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/api/employees') ||
    pathname.startsWith('/api/attendance');

  if (isProtectedPath && !sessionCookie?.value) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  if ((pathname === '/signin' || pathname === '/login') && sessionCookie?.value) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
