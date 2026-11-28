# Next.js 15 / 16 Migration Plan (`gym-crm`)

## Why Next.js 16 Was Not Forced
`gym-crm` currently runs `next@14.2.35` with `react@18.3.1` and `eslint@8.57.1`. Upgrading directly to Next.js 15/16 triggers verified breaking changes caught by TypeScript and CI (`PR #8`):

1. **Asynchronous Dynamic Request APIs (`NextRequest` / `cookies()`):**
   - `src/lib/auth-server.ts` lines 105, 118, 132 call synchronous `cookies().set(...)` and `cookies().get(...)`.
   - Next 15+ returns `Promise<ReadonlyRequestCookies>`; callers (`setSessionCookie`, `clearSessionCookie`, `getCurrentUser`) and their route/page call sites must be converted to `async`/`await`.
2. **Asynchronous Dynamic Route Params (`RouteParams`):**
   - Dynamic API routes (`src/app/api/inventory/[id]/route.ts`, `members/[id]`, `nutrition/[id]`, `workouts/[id]`) must update `RouteParams` from `{ params: { id: string } }` to `{ params: Promise<{ id: string }> }` and `await params`.
3. **ESLint & Tooling Breaking Changes (Next 16):**
   - `next lint` is removed in Next.js 16; `eslint-config-next@16` requires `eslint >= 9` and flat config (`eslint.config.mjs`).
4. **React 19 Peer & Runtime Regression Verification:**
   - Full smoke testing of Recharts, Framer Motion, PDF invoice print view, and Vercel build (`scripts/build.js`).

## Phased Rollout Plan
1. Upgrade `next` 14.2.35 -> 15.5.29 first on an isolated PR branch; convert `cookies()` and `[id]` `RouteParams` to `async`/`await`.
2. Run `tsc --noEmit`, `npm test`, Playwright/smoke route tests, and Vercel preview verification.
3. Upgrade `eslint` 8 -> 9 + `eslint-config-next@16` + `next@16.4.6`; replace `next lint` with `eslint .`.
4. Verify zero Dependabot alerts for `next` and `postcss` before merging to `main`.
