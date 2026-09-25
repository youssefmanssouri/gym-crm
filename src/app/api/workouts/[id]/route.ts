import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/db';
import { updateWorkoutPlanSchema } from '@/lib/validations';
import { WorkoutPlan } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const plan = await prisma.workoutPlan.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    if (!plan) {
      return NextResponse.json({ success: false, error: 'Workout plan not found' }, { status: 404 });
    }

    // Ownership & IDOR Protection:
    // A Member can only access a plan if it's a general template or assigned to them directly
    if (user.role === 'MEMBER' && plan.assignedToId !== user.id && !plan.isTemplate) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not have access to this member routine' },
        { status: 403 }
      );
    }

    let exercises = [];
    try {
      exercises = JSON.parse(plan.exercisesJson || '[]');
    } catch {
      exercises = [];
    }

    const formatted: WorkoutPlan = {
      id: plan.id,
      title: plan.title,
      description: plan.description || '',
      level: plan.level as any,
      goal: plan.goal || 'Hypertrophy',
      isTemplate: plan.isTemplate,
      createdBy: plan.createdBy?.name || 'Coach',
      assignedToName: plan.assignedTo?.name,
      exercises,
      createdAt: plan.createdAt.toISOString().slice(0, 10),
    };

    return NextResponse.json({ success: true, workout: formatted });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch workout plan' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const existing = await prisma.workoutPlan.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Workout plan not found' }, { status: 404 });
    }

    // Ownership / Authorization:
    // Member can only edit plans they personally created
    if (user.role === 'MEMBER' && existing.createdById !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You cannot modify this workout plan' },
        { status: 403 }
      );
    }

    // Trainer can edit plans they created
    if (user.role === 'TRAINER' && existing.createdById !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions to modify this workout' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
    }

    const parsed = updateWorkoutPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const updated = await prisma.workoutPlan.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.level && { level: data.level }),
        ...(data.goal !== undefined && { goal: data.goal }),
        ...(data.isTemplate !== undefined && user.role !== 'MEMBER' && { isTemplate: data.isTemplate }),
        ...(data.assignedToId !== undefined && user.role !== 'MEMBER' && { assignedToId: data.assignedToId }),
        ...(data.exercises && { exercisesJson: JSON.stringify(data.exercises) }),
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });

    let exercises = [];
    try {
      exercises = JSON.parse(updated.exercisesJson || '[]');
    } catch {
      exercises = [];
    }

    return NextResponse.json({
      success: true,
      workout: {
        id: updated.id,
        title: updated.title,
        description: updated.description || '',
        level: updated.level,
        goal: updated.goal,
        isTemplate: updated.isTemplate,
        createdBy: updated.createdBy?.name || user.name,
        assignedToName: updated.assignedTo?.name,
        exercises,
        createdAt: updated.createdAt.toISOString().slice(0, 10),
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update workout plan' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const existing = await prisma.workoutPlan.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Workout plan not found' }, { status: 404 });
    }

    // Ownership / Authorization:
    if (user.role === 'MEMBER' && existing.createdById !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You cannot delete this workout plan' },
        { status: 403 }
      );
    }

    if (user.role === 'TRAINER' && existing.createdById !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient privileges' },
        { status: 403 }
      );
    }

    await prisma.workoutPlan.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Workout plan deleted successfully' });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to delete workout plan' }, { status: 500 });
  }
}
