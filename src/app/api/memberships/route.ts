import { NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth-server';
import { prisma } from '@/lib/db';
import { createMembershipPlanSchema } from '@/lib/validations';
import { MembershipPlan } from '@/lib/types';
import { recordAuditLog, extractClientIp } from '@/lib/audit';

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
    console.error('Failed to retrieve membership plans from database:', error);
    return NextResponse.json(
      { success: false, error: 'Database service unavailable. Failed to retrieve membership plans.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await requireRole(['ADMIN', 'MANAGER']);
    const ipAddress = extractClientIp(request);
    const body = await request.json().catch(() => null);
    const parsed = createMembershipPlanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, description, durationMonths, price, type, features } = parsed.data;

    const newPlan = await prisma.membershipPlan.create({
      data: {
        name,
        description,
        durationMonths,
        price,
        type,
        features: Array.isArray(features) ? features.join(', ') : (features || ''),
        isActive: true,
      },
    });

    await recordAuditLog({
      actor: authUser,
      action: 'CREATE_PLAN',
      entity: 'MembershipPlan',
      details: `Created membership plan "${newPlan.name}" ($${newPlan.price}, ${newPlan.durationMonths}mo, ID: ${newPlan.id})`,
      ipAddress,
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
