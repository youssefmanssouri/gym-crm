import { NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth-server';
import { prisma } from '@/lib/db';
import { createMemberSchema } from '@/lib/validations';
import { MemberProfile } from '@/lib/types';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireAuth();

    // Verify authorized role
    const authorizedRoles = ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'TRAINER'];
    if (!authorizedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient privileges' },
        { status: 403 }
      );
    }

    const profiles = await prisma.memberProfile.findMany({
      include: {
        user: true,
        memberships: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { joinDate: 'desc' },
    });

    const formattedMembers: MemberProfile[] = profiles.map((p) => {
      const activeMembership = p.memberships[0];
      return {
        id: p.id,
        userId: p.userId,
        user: {
          id: p.user.id,
          email: p.user.email,
          name: p.user.name,
          role: p.user.role,
          status: p.user.status,
          avatar: p.user.avatar || undefined,
          phone: p.user.phone || undefined,
          bio: p.user.bio || undefined,
          createdAt: p.user.createdAt.toISOString().slice(0, 10),
        },
        gender: p.gender || undefined,
        dob: p.dob ? p.dob.toISOString().slice(0, 10) : undefined,
        heightCm: p.heightCm || undefined,
        weightKg: p.weightKg || undefined,
        targetWeightKg: p.targetWeightKg || undefined,
        fitnessGoal: p.fitnessGoal || undefined,
        medicalNotes: p.medicalNotes || undefined,
        emergencyContactName: p.emergencyContactName || undefined,
        emergencyContactPhone: p.emergencyContactPhone || undefined,
        qrCode: p.qrCode,
        joinDate: p.joinDate.toISOString().slice(0, 10),
        membership: activeMembership
          ? {
              id: activeMembership.id,
              memberId: activeMembership.memberId,
              planId: activeMembership.planId,
              plan: {
                id: activeMembership.plan.id,
                name: activeMembership.plan.name,
                description: activeMembership.plan.description || '',
                durationMonths: activeMembership.plan.durationMonths,
                price: activeMembership.plan.price,
                type: activeMembership.plan.type,
                features: activeMembership.plan.features.split(',').map((f) => f.trim()),
                isPopular: activeMembership.plan.isPopular,
                isActive: activeMembership.plan.isActive,
              },
              startDate: activeMembership.startDate.toISOString().slice(0, 10),
              endDate: activeMembership.endDate.toISOString().slice(0, 10),
              status: activeMembership.status,
              autoRenew: activeMembership.autoRenew,
              pricePaid: activeMembership.pricePaid,
            }
          : undefined,
      };
    });

    return NextResponse.json({
      success: true,
      members: formattedMembers,
      total: formattedMembers.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error && error.message === 'UNAUTHORIZED'
      ? 'Unauthorized'
      : 'Authentication required';
    return NextResponse.json(
      { success: false, error: message },
      { status: 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(['ADMIN', 'MANAGER', 'RECEPTIONIST']);

    const body = await request.json().catch(() => null);
    const parsed = createMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      gender,
      heightCm,
      weightKg,
      targetWeightKg,
      fitnessGoal,
      medicalNotes,
      emergencyContactName,
      emergencyContactPhone,
      planId,
    } = parsed.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'A member or user with this email address already exists.' },
        { status: 409 }
      );
    }

    // Find the membership plan
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Selected membership plan was not found.' },
        { status: 404 }
      );
    }

    // Generate collision-resistant unique QR code
    const uniqueQr = `APEX-M-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomAvatar = `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&w=300&q=80`;
    const defaultMemberPassword = bcrypt.hashSync('ApexMember2026!', 10);

    const now = new Date();
    const endDate = new Date(now.getTime() + plan.durationMonths * 30 * 24 * 60 * 60 * 1000);

    // Atomic creation via transaction
    const newMemberProfile = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash: defaultMemberPassword,
          name,
          phone,
          avatar: randomAvatar,
          role: 'MEMBER',
          status: 'ACTIVE',
        },
      });

      const profile = await tx.memberProfile.create({
        data: {
          userId: newUser.id,
          gender,
          heightCm,
          weightKg,
          targetWeightKg,
          fitnessGoal,
          medicalNotes,
          emergencyContactName,
          emergencyContactPhone,
          qrCode: uniqueQr,
          joinDate: now,
        },
        include: { user: true },
      });

      const membership = await tx.memberMembership.create({
        data: {
          memberId: profile.id,
          planId: plan.id,
          startDate: now,
          endDate,
          status: 'ACTIVE',
          autoRenew: true,
          pricePaid: plan.price,
        },
        include: { plan: true },
      });

      // Automatically log initial membership fee payment
      await tx.payment.create({
        data: {
          userId: newUser.id,
          membershipId: membership.id,
          amount: plan.price,
          paymentMethod: 'CARD',
          status: 'COMPLETED',
          invoiceNumber: `INV-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
          description: `Initial Registration & ${plan.name} Membership Fee`,
          date: now,
        },
      });

      return {
        ...profile,
        membership,
      };
    });

    return NextResponse.json(
      {
        success: true,
        member: {
          id: newMemberProfile.id,
          userId: newMemberProfile.userId,
          user: {
            id: newMemberProfile.user.id,
            email: newMemberProfile.user.email,
            name: newMemberProfile.user.name,
            role: newMemberProfile.user.role,
            status: newMemberProfile.user.status,
            avatar: newMemberProfile.user.avatar || undefined,
            phone: newMemberProfile.user.phone || undefined,
            createdAt: newMemberProfile.user.createdAt.toISOString().slice(0, 10),
          },
          gender: newMemberProfile.gender || undefined,
          heightCm: newMemberProfile.heightCm || undefined,
          weightKg: newMemberProfile.weightKg || undefined,
          targetWeightKg: newMemberProfile.targetWeightKg || undefined,
          fitnessGoal: newMemberProfile.fitnessGoal || undefined,
          qrCode: newMemberProfile.qrCode,
          joinDate: newMemberProfile.joinDate.toISOString().slice(0, 10),
          membership: {
            id: newMemberProfile.membership.id,
            memberId: newMemberProfile.membership.memberId,
            planId: newMemberProfile.membership.planId,
            plan: {
              id: newMemberProfile.membership.plan.id,
              name: newMemberProfile.membership.plan.name,
              description: newMemberProfile.membership.plan.description || '',
              durationMonths: newMemberProfile.membership.plan.durationMonths,
              price: newMemberProfile.membership.plan.price,
              type: newMemberProfile.membership.plan.type,
              features: newMemberProfile.membership.plan.features.split(',').map((f) => f.trim()),
              isActive: newMemberProfile.membership.plan.isActive,
            },
            startDate: newMemberProfile.membership.startDate.toISOString().slice(0, 10),
            endDate: newMemberProfile.membership.endDate.toISOString().slice(0, 10),
            status: newMemberProfile.membership.status,
            autoRenew: newMemberProfile.membership.autoRenew,
            pricePaid: newMemberProfile.membership.pricePaid,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    }
    console.error('Error creating member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create member record' },
      { status: 500 }
    );
  }
}
