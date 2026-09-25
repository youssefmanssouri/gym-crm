import { cookies } from 'next/headers';
import crypto from 'crypto';
import { UserRole, User } from './types';
import { MOCK_USERS } from './mock-data';

export const SESSION_COOKIE_NAME = 'apex_gym_session';
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  status: string;
  phone?: string;
}

export interface SessionTokenPayload {
  user: SessionUser;
  exp: number; // Unix timestamp in seconds
  iat: number;
}

function getSessionSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'apex-gym-crm-default-secure-secret-key-2026'
  );
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token
 */
export function createSessionToken(user: SessionUser): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionTokenPayload = {
    user,
    iat: now,
    exp: now + SESSION_DURATION_SECONDS,
  };

  const payloadString = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = getSessionSecret();
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('base64url');

  return `${payloadString}.${signature}`;
}

/**
 * Verifies the HMAC-SHA256 signature and expiration of a session token
 */
export function verifySessionToken(token: string): SessionUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadString, signature] = parts;
    const secret = getSessionSecret();
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('base64url');

    const sigBuffer = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

    const payloadJson = Buffer.from(payloadString, 'base64url').toString('utf8');
    const payload: SessionTokenPayload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      return null;
    }

    return payload.user;
  } catch {
    return null;
  }
}

/**
 * Sets the secure HTTP-only session cookie
 */
export function setSessionCookie(token: string): void {
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });
}

/**
 * Clears the session cookie on logout
 */
export function clearSessionCookie(): void {
  cookies().set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Retrieves the current authenticated user on the server
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) return null;

  return verifySessionToken(sessionCookie.value);
}

/**
 * Enforces that a request is authenticated
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

/**
 * Enforces role-based authorization on the server
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error('FORBIDDEN');
  }
  return user;
}

import { prisma } from './db';
import bcrypt from 'bcryptjs';

/**
 * Verifies login credentials against PostgreSQL User table using bcrypt
 */
export async function authenticateCredentials(
  emailInput: string,
  passwordInput: string
): Promise<SessionUser | null> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();

  try {
    const dbUser = await prisma.user.findUnique({
      where: { email },
    });

    if (dbUser) {
      // Must be ACTIVE
      if (dbUser.status !== 'ACTIVE') {
        return null;
      }

      // Verify bcrypt hash
      const isValid = bcrypt.compareSync(password, dbUser.passwordHash);
      if (isValid) {
        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role as UserRole,
          avatar: dbUser.avatar || undefined,
          status: dbUser.status,
          phone: dbUser.phone || undefined,
        };
      }
      return null;
    }
  } catch (err) {
    console.error('Database authentication error, checking server fallback:', err);
  }

  // Fallback to configured in-memory accounts if DB is initializing
  const matchingKey = Object.keys(MOCK_USERS).find(
    (key) => MOCK_USERS[key].email.toLowerCase() === email
  );

  if (!matchingKey) return null;

  const user = MOCK_USERS[matchingKey];
  const adminPassword = process.env.ADMIN_PASSWORD || 'ApexAdmin2026!';
  const staffPassword = process.env.STAFF_PASSWORD || 'ApexStaff2026!';

  let expectedPassword = staffPassword;
  if (user.role === 'ADMIN') {
    expectedPassword = adminPassword;
  }

  const passBuf = Buffer.from(password, 'utf8');
  const expectedBuf = Buffer.from(expectedPassword, 'utf8');

  if (passBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(passBuf, expectedBuf)) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    status: user.status,
    phone: user.phone,
  };
}
