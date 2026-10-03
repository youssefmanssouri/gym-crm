const { execSync } = require('child_process');

const env = { ...process.env };

// Resolve connection URLs from Neon Vercel Integration if not set explicitly
env.DATABASE_URL =
  env.DATABASE_URL ||
  env.DATABASE_URL_POSTGRES_PRISMA_URL ||
  env.DATABASE_URL_DATABASE_URL ||
  env.storage_POSTGRES_PRISMA_URL;

env.DIRECT_URL =
  env.DIRECT_URL ||
  env.DATABASE_URL_POSTGRES_URL_NON_POOLING ||
  env.DATABASE_URL_UNPOOLED ||
  env.storage_POSTGRES_URL_NON_POOLING ||
  env.DATABASE_URL;

console.log('[BUILD] Generating Prisma Client...');
execSync('npx prisma generate', { env, stdio: 'inherit' });

// If running in a cloud deployment environment with Neon DIRECT_URL configured, deploy pending migrations
if (env.DIRECT_URL && !env.DIRECT_URL.includes('localhost') && process.env.VERCEL) {
  console.log('[BUILD] Applying Prisma migrations to cloud database...');
  try {
    execSync('npx prisma migrate deploy', { env, stdio: 'inherit' });
    console.log('[BUILD] Prisma migrations deployed successfully.');
  } catch (err) {
    console.error('[BUILD] Prisma migration deployment error:', err.message);
    process.exit(1);
  }
}

console.log('[BUILD] Building Next.js application...');
execSync('npx next build', { env, stdio: 'inherit' });
