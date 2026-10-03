import { NextResponse } from 'next/server';
import { getCurrentUser, clearSessionCookie } from '@/lib/auth-server';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    clearSessionCookie();
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user,
    role: user.role,
  });
}
