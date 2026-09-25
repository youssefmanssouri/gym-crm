import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/db';
import { createWorkoutPlanSchema } from '@/lib/validations';
import { WorkoutPlan } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireAuth();

    let whereClause: any = {};
    if (user.role === 'MEMBER') {
      // Members only see plans assigned to them or general templates
      whereClause = {
        OR: [
          { assignedToId: user.id },
          { isTemplate: true },
        ],
      };
    }

    const plans = await prisma.workoutPlan.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const formatted: WorkoutPlan[] = plans.map((p) => {
      let parsedExercises = [];
      try {
        parsedExercises = JSON.parse(p.exercisesJson || '[]');
      } catch {
        parsedExercises = [];
      }

      return {
        id: p.id,
        title: p.title,
        description: p.description || '',
        level: p.level as any,
        goal: p.goal || 'Hypertrophy',
        isTemplate: p.isTemplate,
        createdBy: p.createdBy?.name || 'Coach',
        assignedToName: p.assignedTo?.name || undefined,
        exercises: parsedExercises,
        createdAt: p.createdAt.toISOString().slice(0, 10),
      };
    });

    return NextResponse.json({ success: true, workouts: formatted });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch workouts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
    }

    const parsed = createWorkoutPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Authorization & Ownership rules
    let assignedToId = data.assignedToId || null;
    let isTemplate = data.isTemplate;

    if (user.role === 'MEMBER') {
      // A member cannot create gym-wide templates or assign to other members
      isTemplate = false;
      assignedToId = user.id;
    } else if (assignedToId) {
      // Validate that assigned user exists
      const targetUser = await prisma.user.findUnique({ where: { id: assignedToId } });
      if (!targetUser) {
        return NextResponse.json({ success: false, error: 'Assigned member not found' }, { status: 404 });
      }
    }

    const created = await prisma.workoutPlan.create({
      data: {
        title: data.title,
        description: data.description,
        level: data.level,
        goal: data.goal,
        isTemplate,
        createdById: user.id, // Enforce creator strictly from session
        assignedToId,
        exercisesJson: JSON.stringify(data.exercises),
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        workout: {
          id: created.id,
          title: created.title,
          description: created.description || '',
          level: created.level,
          goal: created.goal,
          isTemplate: created.isTemplate,
          createdBy: created.createdBy?.name || user.name,
          assignedToName: created.assignedTo?.name,
          exercises: data.exercises,
          createdAt: created.createdAt.toISOString().slice(0, 10),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create workout plan' }, { status: 500 });
  }
}
