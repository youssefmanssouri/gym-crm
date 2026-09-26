import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-server';
import { prisma } from '@/lib/db';
import { checkInSchema } from '@/lib/validations';
import { AttendanceRecord, MemberProfile } from '@/lib/types';
import { MOCK_MEMBERS } from '@/lib/mock-data';

export async function POST(request: Request) {
  try {
    const authStaff = await requireRole(['ADMIN', 'MANAGER', 'RECEPTIONIST', 'TRAINER']);

    const body = await request.json().catch(() => null);
    const parsed = checkInSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Valid QR code or pass is required' },
        { status: 400 }
      );
    }

    const { qrCode } = parsed.data;
    const cleanCode = qrCode.trim().toLowerCase();

    try {
      // 1. Search member profile by qrCode (exact or case-insensitive) or email
      const member = await prisma.memberProfile.findFirst({
        where: {
          OR: [
            { qrCode: { equals: qrCode.trim(), mode: 'insensitive' } },
            { user: { email: { equals: cleanCode, mode: 'insensitive' } } },
          ],
        },
        include: {
          user: true,
          memberships: {
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      if (!member) {
        return NextResponse.json(
          { success: false, error: 'Invalid QR Pass Code or unregistered member account.' },
          { status: 404 }
        );
      }

      // 2. Check user status
      if (member.user.status !== 'ACTIVE') {
        return NextResponse.json(
          {
            success: false,
            error: `Access Denied: Member account status is ${member.user.status}.`,
          },
          { status: 403 }
        );
      }

      // 3. Check membership status
      const activeSub = member.memberships[0];
      if (!activeSub || activeSub.status !== 'ACTIVE' || activeSub.endDate < new Date()) {
        const statusText = activeSub?.status || 'EXPIRED';
        return NextResponse.json(
          {
            success: false,
            error: `Access Denied: Membership status is ${statusText}. Please renew.`,
            member: {
              id: member.id,
              userId: member.userId,
              userName: member.user.name,
              membershipStatus: statusText,
            },
          },
          { status: 403 }
        );
      }

      // 4. Duplicate Check-in Prevention (within last 2 minutes)
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      const recentCheckIn = await prisma.attendance.findFirst({
        where: {
          userId: member.userId,
          checkInTime: { gte: twoMinutesAgo },
        },
        orderBy: { checkInTime: 'desc' },
      });

      if (recentCheckIn) {
        return NextResponse.json(
          {
            success: false,
            error: `Member ${member.user.name} already checked in at ${recentCheckIn.checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Duplicate check-ins prevented.`,
          },
          { status: 409 }
        );
      }

      // 5. Create Attendance record with authoritative server timestamp
      const now = new Date();
      const attendance = await prisma.attendance.create({
        data: {
          userId: member.userId,
          checkInTime: now,
          method: 'QR_CODE',
          verifiedBy: authStaff.name,
        },
        include: { user: true },
      });

      const formattedRecord: AttendanceRecord = {
        id: attendance.id,
        userId: attendance.userId,
        userName: attendance.user.name,
        userAvatar: attendance.user.avatar || undefined,
        userRole: attendance.user.role,
        checkInTime: attendance.checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        method: attendance.method,
        verifiedBy: attendance.verifiedBy || undefined,
      };

      const formattedMember: MemberProfile = {
        id: member.id,
        userId: member.userId,
        user: {
          id: member.user.id,
          email: member.user.email,
          name: member.user.name,
          role: member.user.role,
          status: member.user.status,
          avatar: member.user.avatar || undefined,
          phone: member.user.phone || undefined,
          createdAt: member.user.createdAt.toISOString().slice(0, 10),
        },
        qrCode: member.qrCode,
        joinDate: member.joinDate.toISOString().slice(0, 10),
        membership: activeSub
          ? {
              id: activeSub.id,
              memberId: activeSub.memberId,
              planId: activeSub.planId,
              startDate: activeSub.startDate.toISOString().slice(0, 10),
              endDate: activeSub.endDate.toISOString().slice(0, 10),
              status: activeSub.status,
              autoRenew: activeSub.autoRenew,
              pricePaid: activeSub.pricePaid,
            }
          : undefined,
      };

      return NextResponse.json(
        {
          success: true,
          message: `Welcome, ${member.user.name}! Access Granted.`,
          attendance: formattedRecord,
          member: formattedMember,
        },
        { status: 201 }
      );
    } catch (dbError: unknown) {
      console.warn('Database query failed for check-in, executing verified demo check-in fallback:', dbError);

      // Deterministic demo mode check-in verification
      const mockMember = MOCK_MEMBERS.find(
        (m) =>
          m.qrCode.toLowerCase() === cleanCode ||
          m.user.email.toLowerCase() === cleanCode
      );

      if (!mockMember) {
        return NextResponse.json(
          { success: false, error: 'Invalid QR Pass Code or unregistered member account.' },
          { status: 404 }
        );
      }

      // Check user account status
      if (mockMember.user.status !== 'ACTIVE') {
        return NextResponse.json(
          {
            success: false,
            error: `Access Denied: Member account status is ${mockMember.user.status}.`,
          },
          { status: 403 }
        );
      }

      // Check membership plan validity
      const activeSub = mockMember.membership;
      if (!activeSub || activeSub.status !== 'ACTIVE') {
        const statusText = activeSub?.status || 'EXPIRED';
        return NextResponse.json(
          {
            success: false,
            error: `Access Denied: Membership status is ${statusText}. Please renew.`,
            member: {
              id: mockMember.id,
              userId: mockMember.userId,
              userName: mockMember.user.name,
              membershipStatus: statusText,
            },
          },
          { status: 403 }
        );
      }

      const now = new Date();
      const formattedRecord: AttendanceRecord = {
        id: `att-demo-${Date.now()}`,
        userId: mockMember.userId,
        userName: mockMember.user.name,
        userAvatar: mockMember.user.avatar,
        userRole: mockMember.user.role,
        checkInTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        method: 'QR_CODE',
        verifiedBy: authStaff.name || 'Receptionist Terminal',
      };

      return NextResponse.json(
        {
          success: true,
          message: `Welcome, ${mockMember.user.name}! Access Granted.`,
          attendance: formattedRecord,
          member: mockMember,
          isDemoMode: true,
        },
        { status: 201 }
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      if (error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    console.error('Error during check-in:', error);
    return NextResponse.json({ success: false, error: 'Check-in processing error' }, { status: 500 });
  }
}

