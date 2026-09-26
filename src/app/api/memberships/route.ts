import { NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth-server';
import { prisma } from '@/lib/db';
import { MembershipPlan } from '@/lib/types';
import { MOCK_MEMBERSHIP_PLANS } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAuth();

    const plans = await prisma.membershipPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    const formatted: MembershipPlan[] = plans.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      durationMonths: p.durationMonths,
      price: p.price,
      type: p.type,
      features: p.features ? p.features.split(',').map((f) => f.trim()) : [],
      isPopular: p.isPopular,
      isActive: p.isActive,
    }));

    return NextResponse.json({
      success: true,
      plans: formatted,
      total: formatted.length,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.warn('PostgreSQL query failed, serving verified portfolio demo membership plans:', error);
    return NextResponse.json({
      success: true,
      plans: MOCK_MEMBERSHIP_PLANS,
      total: MOCK_MEMBERSHIP_PLANS.length,
    });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(['ADMIN', 'MANAGER']);
    const body = await request.json().catch(() => ({}));
    const { name, description, durationMonths, price, type, features } = body;

    if (!name || typeof price !== 'number') {
      return NextResponse.json({ success: false, error: 'Name and numeric price are required' }, { status: 400 });
    }

    const newPlan = await prisma.membershipPlan.create({
      data: {
        name,
        description: description || '',
        durationMonths: durationMonths || 1,
        price,
        type: type || 'MONTHLY',
        features: Array.isArray(features) ? features.join(', ') : (features || ''),
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, plan: newPlan }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      if (error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create plan' }, { status: 500 });
  }
}
