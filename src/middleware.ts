import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
const SESSION_COOKIE_NAME = 'apex_gym_session';
const READ_ONLY_MESSAGE = 'This is a read-only demo. Changes are disabled.';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
// Signing out, switching account or registering replaces the demo session; it does not change demo data.
const ALLOWED_DEMO_MUTATIONS = new Set(['/api/auth/logout', '/api/auth/login', '/api/auth/demo', '/api/auth/register']);

/**
 * Reads the `demo` claim from the session payload. The signature is not checked
 * here: a token edited to drop the claim fails HMAC verification in the API
 * route, and a valid token that carries it is blocked below. Either way, a demo
 * session cannot change data.
 */
function isDemoSession(token: string | undefined): boolean {
  if (!token) return false;
  const payload = token.split('.')[0];
  if (!payload) return false;
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4)));
    return json?.user?.demo === true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Read-only demo: reject every data-changing API request.
  if (
    pathname.startsWith('/api/') &&
    !SAFE_METHODS.has(request.method) &&
    !ALLOWED_DEMO_MUTATIONS.has(pathname) &&
    isDemoSession(sessionCookie)
  ) {
    return NextResponse.json({ success: false, error: READ_ONLY_MESSAGE }, { status: 403 });
  }

  // Protect main CRM application root
  if (pathname === '/') {
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/register', '/api/:path*'],
};
