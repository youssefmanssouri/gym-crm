import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireAuth();

    // Verify authorized staff roles
    const authorizedRoles = ['ADMIN', 'MANAGER', 'TRAINER', 'RECEPTIONIST'];
    if (!authorizedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient privileges' },
        { status: 403 }
      );
    }

    const staffUsers = await prisma.user.findMany({
      where: {
        role: {
          in: [UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER, UserRole.RECEPTIONIST],
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        phone: true,
        bio: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const staff = staffUsers.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      status: u.status,
      avatar: u.avatar || undefined,
      phone: u.phone || undefined,
      bio: u.bio || undefined,
      createdAt: u.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, staff });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    console.error('Failed to fetch staff roster from database:', error);
    return NextResponse.json(
      { success: false, error: 'Database service unavailable. Failed to fetch staff roster.' },
      { status: 500 }
    );
  }
}
