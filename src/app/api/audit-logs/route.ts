import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/db';
import { SecurityAuditLog } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireAuth();

    // Verify authorized management roles
    const authorizedRoles = ['ADMIN', 'MANAGER'];
    if (!authorizedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient privileges' },
        { status: 403 }
      );
    }

    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userEmail: true,
        userRole: true,
        action: true,
        entity: true,
        details: true,
        ipAddress: true,
        createdAt: true,
      },
    });

    const formattedLogs: SecurityAuditLog[] = logs.map((log) => ({
      id: log.id,
      userEmail: log.userEmail,
      userRole: log.userRole,
      action: log.action,
      entity: log.entity,
      details: log.details,
      ipAddress: log.ipAddress || '127.0.0.1',
      createdAt: log.createdAt.toISOString().replace('T', ' ').substring(0, 19),
    }));

    return NextResponse.json({ success: true, logs: formattedLogs });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    console.error('Failed to fetch security audit logs from database:', error);
    return NextResponse.json(
      { success: false, error: 'Database service unavailable. Failed to fetch audit logs.' },
      { status: 500 }
    );
  }
}
