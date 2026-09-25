import { NextResponse } from 'next/server';
import {
  authenticateCredentials,
  createSessionToken,
  setSessionCookie,
} from '@/lib/auth-server';

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

    const user = await authenticateCredentials(email, password);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = createSessionToken(user);
    setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
