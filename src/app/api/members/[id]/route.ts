import { NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth-server';
import { prisma } from '@/lib/db';
import { updateMemberSchema } from '@/lib/validations';

interface RouteParams {
  params: { id: string };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    await requireAuth();
    const { id } = params;

    const profile = await prisma.memberProfile.findUnique({
      where: { id },
      include: {
        user: true,
        memberships: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    const activeMembership = profile.memberships[0];

    return NextResponse.json({
      success: true,
      member: {
        id: profile.id,
        userId: profile.userId,
        user: {
          id: profile.user.id,
          email: profile.user.email,
          name: profile.user.name,
          role: profile.user.role,
          status: profile.user.status,
          avatar: profile.user.avatar || undefined,
          phone: profile.user.phone || undefined,
          createdAt: profile.user.createdAt.toISOString().slice(0, 10),
        },
        gender: profile.gender || undefined,
        dob: profile.dob ? profile.dob.toISOString().slice(0, 10) : undefined,
        heightCm: profile.heightCm || undefined,
        weightKg: profile.weightKg || undefined,
        targetWeightKg: profile.targetWeightKg || undefined,
        fitnessGoal: profile.fitnessGoal || undefined,
        medicalNotes: profile.medicalNotes || undefined,
        emergencyContactName: profile.emergencyContactName || undefined,
        emergencyContactPhone: profile.emergencyContactPhone || undefined,
        qrCode: profile.qrCode,
        joinDate: profile.joinDate.toISOString().slice(0, 10),
        membership: activeMembership
          ? {
              id: activeMembership.id,
              memberId: activeMembership.memberId,
              planId: activeMembership.planId,
              plan: {
                id: activeMembership.plan.id,
                name: activeMembership.plan.name,
                price: activeMembership.plan.price,
                durationMonths: activeMembership.plan.durationMonths,
                type: activeMembership.plan.type,
                features: activeMembership.plan.features.split(',').map((f) => f.trim()),
                isActive: activeMembership.plan.isActive,
              },
              startDate: activeMembership.startDate.toISOString().slice(0, 10),
              endDate: activeMembership.endDate.toISOString().slice(0, 10),
              status: activeMembership.status,
              autoRenew: activeMembership.autoRenew,
              pricePaid: activeMembership.pricePaid,
            }
          : undefined,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    await requireRole(['ADMIN', 'MANAGER', 'RECEPTIONIST']);
    const { id } = params;
    const body = await request.json().catch(() => null);
    const parsed = updateMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const member = await prisma.memberProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!member) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    const { name, phone, status, ...profileFields } = parsed.data;

    await prisma.$transaction(async (tx) => {
      if (name || phone || status) {
        await tx.user.update({
          where: { id: member.userId },
          data: {
            name: name ?? undefined,
            phone: phone ?? undefined,
            status: status ?? undefined,
          },
        });
      }

      await tx.memberProfile.update({
        where: { id },
        data: profileFields,
      });
    });

    return NextResponse.json({ success: true, message: 'Member profile updated successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      if (error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await requireRole(['ADMIN', 'MANAGER']);
    const { id } = params;

    const profile = await prisma.memberProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    // Cascade deletes the User and associated profile/memberships
    await prisma.user.delete({
      where: { id: profile.userId },
    });

    return NextResponse.json({ success: true, message: 'Member deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      if (error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
  }
}
