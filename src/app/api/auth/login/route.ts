import { NextResponse } from 'next/server';
import {
  authenticateCredentials,
  createSessionToken,
  setSessionCookie,
} from '@/lib/auth-server';
import { extractClientIp } from '@/lib/audit';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const clientIp = extractClientIp(request);
    const rateKey = `login:${clientIp}:${email.trim().toLowerCase()}`;
    const limit = checkRateLimit(rateKey, 10, 15 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many sign-in attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      );
    }

    const user = await authenticateCredentials(email, password);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = createSessionToken(user);
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: unknown) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
