import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-server';
import { prisma } from '@/lib/db';
import { generateAIBusinessInsights, isGeminiConfigured } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Only management and admin roles may access business predictive intelligence
    await requireRole(['ADMIN', 'MANAGER']);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const fourteenDaysAhead = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const [activeMembers, totalMembers, monthlyRevAgg, expiringMemberships] = await Promise.all([
      prisma.memberMembership.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'MEMBER' } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED', date: { gte: startOfMonth } },
      }),
      prisma.memberMembership.count({
        where: { status: 'ACTIVE', endDate: { gte: now, lte: fourteenDaysAhead } },
      }),
    ]);

    const retentionRate =
      totalMembers > 0
        ? Math.min(100, Math.round((activeMembers / totalMembers) * 1000) / 10)
        : 100;
    const churnRate = Math.round((100 - retentionRate) * 10) / 10;

    const kpis = {
      monthlyRevenue: Math.round(monthlyRevAgg._sum.amount || 0),
      activeMembers,
      churnRate,
      expiringMemberships,
    };

    const report = await generateAIBusinessInsights(kpis);
    return NextResponse.json({
      success: true,
      report,
      kpis,
      isLiveAI: isGeminiConfigured(),
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient privileges for business insights' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate strategic business insights' },
      { status: 500 }
    );
  }
}
