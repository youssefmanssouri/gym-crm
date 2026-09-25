import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/db';
import { updateNutritionPlanSchema } from '@/lib/validations';
import { NutritionPlan } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const plan = await prisma.nutritionPlan.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    if (!plan) {
      return NextResponse.json({ success: false, error: 'Nutrition plan not found' }, { status: 404 });
    }

    // Ownership / IDOR Protection:
    if (user.role === 'MEMBER' && plan.assignedToId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not have access to this nutrition plan' },
        { status: 403 }
      );
    }

    let categories = [];
    try {
      categories = JSON.parse(plan.mealsJson || '[]');
    } catch {
      categories = [];
    }

    const formatted: NutritionPlan = {
      id: plan.id,
      title: plan.title,
      dietType: plan.dietType || 'High Protein',
      assignedToName: plan.assignedTo?.name,
      createdBy: plan.createdBy?.name || 'Dietitian',
      dailyCalories: plan.dailyCalories,
      proteinGrams: plan.proteinGrams,
      carbsGrams: plan.carbsGrams,
      fatGrams: plan.fatGrams,
      mealCategories: categories,
      createdAt: plan.createdAt.toISOString().slice(0, 10),
    };

    return NextResponse.json({ success: true, plan: formatted });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch nutrition plan' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const existing = await prisma.nutritionPlan.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Nutrition plan not found' }, { status: 404 });
    }

    // Ownership / Authorization:
    if (user.role === 'MEMBER' && existing.createdById !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You cannot modify this nutrition plan' },
        { status: 403 }
      );
    }

    if (user.role === 'TRAINER' && existing.createdById !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient privileges' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
    }

    const parsed = updateNutritionPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const updated = await prisma.nutritionPlan.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.dietType && { dietType: data.dietType }),
        ...(data.dailyCalories && { dailyCalories: data.dailyCalories }),
        ...(data.proteinGrams !== undefined && { proteinGrams: data.proteinGrams }),
        ...(data.carbsGrams !== undefined && { carbsGrams: data.carbsGrams }),
        ...(data.fatGrams !== undefined && { fatGrams: data.fatGrams }),
        ...(data.assignedToId !== undefined && user.role !== 'MEMBER' && { assignedToId: data.assignedToId }),
        ...(data.mealCategories && { mealsJson: JSON.stringify(data.mealCategories) }),
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });

    let categories = [];
    try {
      categories = JSON.parse(updated.mealsJson || '[]');
    } catch {
      categories = [];
    }

    return NextResponse.json({
      success: true,
      plan: {
        id: updated.id,
        title: updated.title,
        dietType: updated.dietType,
        assignedToName: updated.assignedTo?.name,
        createdBy: updated.createdBy?.name || user.name,
        dailyCalories: updated.dailyCalories,
        proteinGrams: updated.proteinGrams,
        carbsGrams: updated.carbsGrams,
        fatGrams: updated.fatGrams,
        mealCategories: categories,
        createdAt: updated.createdAt.toISOString().slice(0, 10),
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update nutrition plan' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const existing = await prisma.nutritionPlan.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Nutrition plan not found' }, { status: 404 });
    }

    // Ownership / Authorization:
    if (user.role === 'MEMBER' && existing.createdById !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You cannot delete this nutrition plan' },
        { status: 403 }
      );
    }

    if (user.role === 'TRAINER' && existing.createdById !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient privileges' },
        { status: 403 }
      );
    }

    await prisma.nutritionPlan.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Nutrition plan deleted successfully' });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to delete nutrition plan' }, { status: 500 });
  }
}
