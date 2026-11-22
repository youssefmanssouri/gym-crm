import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createSessionToken, setSessionCookie, SessionUser } from '@/lib/auth-server';
import { UserRole } from '@/lib/types';
import { DEMO_USER_ID } from '@/lib/demo';

/** Signs the visitor into the shared read-only demo account (no password). */
export async function POST() {
  try {
    const demoUser = await prisma.user.findUnique({ where: { id: DEMO_USER_ID } });
    if (!demoUser || demoUser.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'The demo account is not available right now.' },
        { status: 503 }
      );
    }

    const user: SessionUser = {
      id: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
      role: demoUser.role as UserRole,
      avatar: demoUser.avatar || undefined,
      status: demoUser.status,
      phone: demoUser.phone || undefined,
      demo: true,
    };
    setSessionCookie(createSessionToken(user));
    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json(
      { success: false, error: 'The demo account is not available right now.' },
      { status: 503 }
    );
  }
}
