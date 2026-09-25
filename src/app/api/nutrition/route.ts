import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/db';
import { createNutritionPlanSchema } from '@/lib/validations';
import { NutritionPlan } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireAuth();

    let whereClause: any = {};
    if (user.role === 'MEMBER') {
      // Member can only view plans assigned to them
      whereClause = { assignedToId: user.id };
    }

    const plans = await prisma.nutritionPlan.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const formatted: NutritionPlan[] = plans.map((p) => {
      let categories = [];
      try {
        categories = JSON.parse(p.mealsJson || '[]');
      } catch {
        categories = [];
      }

      return {
        id: p.id,
        title: p.title,
        dietType: p.dietType || 'High Protein',
        assignedToName: p.assignedTo?.name,
        createdBy: p.createdBy?.name || 'Dietitian',
        dailyCalories: p.dailyCalories,
        proteinGrams: p.proteinGrams,
        carbsGrams: p.carbsGrams,
        fatGrams: p.fatGrams,
        mealCategories: categories,
        createdAt: p.createdAt.toISOString().slice(0, 10),
      };
    });

    return NextResponse.json({ success: true, plans: formatted });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch nutrition plans' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
    }

    const parsed = createNutritionPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    let assignedToId = data.assignedToId || null;
    if (user.role === 'MEMBER') {
      // Member can only assign to themselves
      assignedToId = user.id;
    } else if (assignedToId) {
      const targetUser = await prisma.user.findUnique({ where: { id: assignedToId } });
      if (!targetUser) {
        return NextResponse.json({ success: false, error: 'Assigned member not found' }, { status: 404 });
      }
    }

    const created = await prisma.nutritionPlan.create({
      data: {
        title: data.title,
        dietType: data.dietType,
        createdById: user.id, // Enforce creator from session
        assignedToId,
        dailyCalories: data.dailyCalories,
        proteinGrams: data.proteinGrams,
        carbsGrams: data.carbsGrams,
        fatGrams: data.fatGrams,
        mealsJson: JSON.stringify(data.mealCategories),
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        plan: {
          id: created.id,
          title: created.title,
          dietType: created.dietType,
          assignedToName: created.assignedTo?.name,
          createdBy: created.createdBy?.name || user.name,
          dailyCalories: created.dailyCalories,
          proteinGrams: created.proteinGrams,
          carbsGrams: created.carbsGrams,
          fatGrams: created.fatGrams,
          mealCategories: data.mealCategories,
          createdAt: created.createdAt.toISOString().slice(0, 10),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create nutrition plan' }, { status: 500 });
  }
}
