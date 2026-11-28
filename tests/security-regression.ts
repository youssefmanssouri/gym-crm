import assert from 'node:assert/strict';
import Module from 'node:module';
import path from 'node:path';

// Set explicit test secret before importing route handlers
process.env.SESSION_SECRET = 'test-security-regression-secret-key-2026';

let mockCookieToken: string | undefined;
let mockPrismaResult: unknown = null;
const srcRoot = path.resolve(__dirname, '..', 'src');

type ModuleLoader = (request: string, parent: unknown, isMain: boolean) => unknown;
const mod = Module as unknown as { _load: ModuleLoader };
const originalLoad = mod._load;
mod._load = function (
  request: string,
  parent: unknown,
  isMain: boolean
) {
  if (request === 'next/headers') {
    return {
      cookies: async () => ({
        get: (name: string) =>
          name === 'apex_gym_session' && mockCookieToken ? { value: mockCookieToken } : undefined,
        set: (name: string, value: string) => {
          if (name === 'apex_gym_session') {
            mockCookieToken = value || undefined;
          }
        },
      }),
    };
  }
  if (request === '@/lib/db') {
    return {
      prisma: {
        memberProfile: {
          findUnique: async () => mockPrismaResult,
        },
      },
    };
  }
  const resolvedRequest = request.startsWith('@/')
    ? path.join(srcRoot, request.slice(2))
    : request;
  return originalLoad.apply(this, [resolvedRequest, parent, isMain]);
};

const auth = require('../src/lib/auth-server') as typeof import('../src/lib/auth-server');
const rateLimit = require('../src/lib/rate-limit') as typeof import('../src/lib/rate-limit');
const validations = require('../src/lib/validations') as typeof import('../src/lib/validations');
const analyticsRoute = require('../src/app/api/analytics/route') as typeof import('../src/app/api/analytics/route');
const inventoryRoute = require('../src/app/api/inventory/route') as typeof import('../src/app/api/inventory/route');
const inventoryByIdRoute = require('../src/app/api/inventory/[id]/route') as typeof import('../src/app/api/inventory/[id]/route');
const memberByIdRoute = require('../src/app/api/members/[id]/route') as typeof import('../src/app/api/members/[id]/route');
const sessionRoute = require('../src/app/api/auth/session/route') as typeof import('../src/app/api/auth/session/route');
const proxyModule = require('../src/proxy') as typeof import('../src/proxy');
const { NextRequest } = require('next/server') as typeof import('next/server');

async function main() {
  // 1. Production session secret fail-closed check
  const prevEnv = process.env.NODE_ENV;
  const prevSecret = process.env.SESSION_SECRET;
  try {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    delete process.env.SESSION_SECRET;
    delete process.env.NEXTAUTH_SECRET;
    assert.throws(() => auth.getSessionSecret(), /FATAL SECURITY CONFIGURATION/);

    process.env.SESSION_SECRET = '   ';
    assert.throws(() => auth.getSessionSecret(), /FATAL SECURITY CONFIGURATION/);

    delete process.env.SESSION_SECRET;
    process.env.NEXTAUTH_SECRET = 'apex-gym-crm-default-secure-secret-key-2026';
    assert.throws(() => auth.getSessionSecret(), /FATAL SECURITY CONFIGURATION/);

    process.env.NEXTAUTH_SECRET = 'explicit-production-nextauth-secret-key-2026';
    assert.equal(auth.getSessionSecret(), 'explicit-production-nextauth-secret-key-2026');
    delete process.env.NEXTAUTH_SECRET;

    process.env.SESSION_SECRET = 'apex-gym-crm-default-secure-secret-key-2026';
    assert.throws(() => auth.getSessionSecret(), /FATAL SECURITY CONFIGURATION/);

    process.env.SESSION_SECRET = 'docker-production-secret-key-gym-crm';
    assert.throws(() => auth.getSessionSecret(), /FATAL SECURITY CONFIGURATION/);

    process.env.SESSION_SECRET = prevSecret;
    assert.equal(auth.getSessionSecret(), prevSecret);
  } finally {
    (process.env as Record<string, string | undefined>).NODE_ENV = prevEnv;
    process.env.SESSION_SECRET = prevSecret;
    delete process.env.NEXTAUTH_SECRET;
  }

  // 2. MEMBER role blocked from staff-only /api/analytics and /api/inventory
  mockCookieToken = auth.createSessionToken({
    id: 'usr-member-1',
    email: 'member1@example.com',
    name: 'Member One',
    role: 'MEMBER',
    status: 'ACTIVE',
  });

  const analyticsRes = await analyticsRoute.GET();
  assert.equal(analyticsRes.status, 403, 'MEMBER must receive 403 on GET /api/analytics');

  const inventoryRes = await inventoryRoute.GET();
  assert.equal(inventoryRes.status, 403, 'MEMBER must receive 403 on GET /api/inventory');

  // 3. MEMBER blocked from reading another member's profile (IDOR check)
  mockPrismaResult = {
    id: 'prof-other',
    userId: 'usr-member-2',
    user: {
      id: 'usr-member-2',
      email: 'other@example.com',
      name: 'Other Member',
      role: 'MEMBER',
      status: 'ACTIVE',
      createdAt: new Date(),
    },
    memberships: [],
    qrCode: 'APEX-M-OTHER',
    joinDate: new Date(),
  };
  const idorRes = await memberByIdRoute.GET(new Request('http://localhost/api/members/prof-other'), {
    params: Promise.resolve({ id: 'prof-other' }),
  });
  assert.equal(idorRes.status, 403, 'MEMBER must receive 403 when reading another member profile');

  // 3b. Async cookies() session lifecycle & async RouteParams RBAC (Next.js 16)
  mockCookieToken = undefined;
  const unauthSessionRes = await sessionRoute.GET();
  assert.equal(unauthSessionRes.status, 401, 'Unauthenticated GET /api/auth/session must return 401');

  const signedToken = auth.createSessionToken({
    id: 'usr-member-1',
    email: 'member1@example.com',
    name: 'Member One',
    role: 'MEMBER',
    status: 'ACTIVE',
  });
  await auth.setSessionCookie(signedToken);
  const currentUser = await auth.getCurrentUser();
  assert.equal(currentUser?.id, 'usr-member-1');

  const authSessionRes = await sessionRoute.GET();
  assert.equal(authSessionRes.status, 200, 'Authenticated GET /api/auth/session must return 200');

  const invPatchRes = await inventoryByIdRoute.PATCH(
    new Request('http://localhost/api/inventory/prod-1', {
      method: 'PATCH',
      body: JSON.stringify({ price: 20 }),
    }),
    { params: Promise.resolve({ id: 'prod-1' }) }
  );
  assert.equal(invPatchRes.status, 403, 'MEMBER must receive 403 on PATCH /api/inventory/[id]');

  const invDeleteRes = await inventoryByIdRoute.DELETE(
    new Request('http://localhost/api/inventory/prod-1', { method: 'DELETE' }),
    { params: Promise.resolve({ id: 'prod-1' }) }
  );
  assert.equal(invDeleteRes.status, 403, 'MEMBER must receive 403 on DELETE /api/inventory/[id]');

  await auth.clearSessionCookie();
  assert.equal(await auth.getCurrentUser(), null, 'clearSessionCookie must clear active session');

  // 3c. Next.js 16 proxy (formerly middleware) route protection & demo read-only enforcement
  const unauthRootReq = new NextRequest('http://localhost/');
  const unauthRootRes = proxyModule.proxy(unauthRootReq);
  assert.equal(unauthRootRes.status, 307, 'Unauthenticated GET / must redirect to /login');
  assert.ok(unauthRootRes.headers.get('location')?.endsWith('/login'));

  const demoToken = auth.createSessionToken({
    id: 'usr-demo',
    email: 'demo@example.com',
    name: 'Demo User',
    role: 'ADMIN',
    status: 'ACTIVE',
    demo: true,
  });
  const demoMutationReq = new NextRequest('http://localhost/api/members', {
    method: 'POST',
    headers: { cookie: `apex_gym_session=${demoToken}` },
  });
  const demoMutationRes = proxyModule.proxy(demoMutationReq);
  assert.equal(demoMutationRes.status, 403, 'Demo session mutation must be blocked by proxy with 403');

  // 4. Input validation boundaries
  assert.equal(validations.updateProductSchema.safeParse({ price: -10 }).success, false);
  assert.equal(validations.updateProductSchema.safeParse({ stockQuantity: -1 }).success, false);
  assert.equal(validations.updateProductSchema.safeParse({}).success, false);
  assert.equal(validations.updateProductSchema.safeParse({ price: 29.99, stockQuantity: 10 }).success, true);

  assert.equal(
    validations.createMembershipPlanSchema.safeParse({ name: 'Pro', price: -5, durationMonths: 1 }).success,
    false
  );
  assert.equal(
    validations.createMembershipPlanSchema.safeParse({ name: 'Pro', price: 49, durationMonths: 0 }).success,
    false
  );
  assert.equal(
    validations.createMembershipPlanSchema.safeParse({ name: 'Pro', price: 49, durationMonths: 1 }).success,
    true
  );

  // 5. Rate limiter enforces 429 threshold
  rateLimit.resetRateLimitStore();
  for (let i = 0; i < 3; i++) {
    assert.equal(rateLimit.checkRateLimit('test:ip', 3, 60_000, 1_000 + i).allowed, true);
  }
  const blocked = rateLimit.checkRateLimit('test:ip', 3, 60_000, 1_005);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds >= 1);

  console.log('ALL_GYM_CRM_SECURITY_REGRESSION_TESTS_PASSED');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
