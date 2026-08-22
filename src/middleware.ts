import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware (DISABLED / PASS-THROUGH)
 *
 * Middleware is preserved for future edge-routing / session evaluation,
 * but currently disabled so all requests pass through freely to layouts
 * and server components/routes where authorization is enforced.
 */
export function middleware(_request: NextRequest) {
  // Pass-through: Allow all requests without interception
  return NextResponse.next();

  /*
  // --- Active Middleware implementation (kept for reference / enablement) ---
  const sessionCookie = request.cookies.get('dayflow_session');
  const { pathname } = request.nextUrl;

  const isPublicPath = pathname === '/login' || pathname.startsWith('/api/auth');
  const isProtectedPath = pathname.startsWith('/dashboard') || pathname.startsWith('/api/employees');

  if (isProtectedPath && !sessionCookie?.value) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/login' && sessionCookie?.value) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
  */
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
