import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/db';
import { AttendanceRecord } from '@/lib/types';
import { MOCK_ATTENDANCE } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAuth();

    const records = await prisma.attendance.findMany({
      include: {
        user: true,
      },
      orderBy: {
        checkInTime: 'desc',
      },
      take: 100,
    });

    const formatted: AttendanceRecord[] = records.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.user.name,
      userAvatar: r.user.avatar || undefined,
      userRole: r.user.role,
      checkInTime: r.checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      checkOutTime: r.checkOutTime ? r.checkOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      method: r.method,
      verifiedBy: r.verifiedBy || undefined,
    }));

    return NextResponse.json({
      success: true,
      attendance: formatted,
      total: formatted.length,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.warn('PostgreSQL query failed, serving verified portfolio demo attendance:', error);
    return NextResponse.json({
      success: true,
      attendance: MOCK_ATTENDANCE,
      total: MOCK_ATTENDANCE.length,
    });
  }
}
