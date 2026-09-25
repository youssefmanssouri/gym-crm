import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
const SESSION_COOKIE_NAME = 'apex_gym_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Protect main CRM application root
  if (pathname === '/') {
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already authenticated and trying to access /login, redirect to /
  if (pathname === '/login') {
    if (sessionCookie) {
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login'],
};
