import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { registerSchema } from '@/lib/validations';
import { createSessionToken, setSessionCookie, SessionUser } from '@/lib/auth-server';
import { UserRole } from '@/lib/types';
import { recordAuditLog, extractClientIp } from '@/lib/audit';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid registration data';
      return NextResponse.json(
        { success: false, error: firstError, details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();
    const avatar = null;
    const uniqueQr = `APEX-M-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let sessionUser: SessionUser;

    try {
      // 1. Check for duplicate account in PostgreSQL
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'An account with this email address already exists' },
          { status: 409 }
        );
      }

      // 2. Hash password with bcrypt
      const passwordHash = bcrypt.hashSync(password, 10);

      // 3. Create user with Admin/Owner role and member profile atomically (matching BusinessOS behavior)
      const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: normalizedEmail,
            passwordHash,
            name: name.trim(),
            avatar,
            role: 'ADMIN',
            status: 'ACTIVE',
          },
        });

        await tx.memberProfile.create({
          data: {
            userId: newUser.id,
            qrCode: uniqueQr,
            fitnessGoal: 'General Fitness',
            joinDate: new Date(),
          },
        });

        await recordAuditLog({
          actor: {
            id: newUser.id,
            email: newUser.email,
            role: 'ADMIN',
          },
          action: 'REGISTER',
          entity: 'User',
          details: `Self-service account registration (ADMIN) for ${newUser.name} (${newUser.email})`,
          ipAddress: extractClientIp(request),
          tx,
        });

        return newUser;
      });

      sessionUser = {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role as UserRole,
        avatar: result.avatar || undefined,
        status: result.status,
        phone: result.phone || undefined,
      };
    } catch (dbErr) {
      console.error('Registration database transaction failed:', dbErr);
      return NextResponse.json(
        {
          success: false,
          error: 'Database service unavailable. Account could not be created.',
          details: dbErr instanceof Error ? dbErr.message : String(dbErr),
        },
        { status: 503 }
      );
    }

    // 4. Create cryptographically signed session token & set HttpOnly cookie
    const token = createSessionToken(sessionUser);
    setSessionCookie(token);

    return NextResponse.json(
      {
        success: true,
        user: sessionUser,
        message: 'Account created successfully',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Registration handler error:', error);
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
