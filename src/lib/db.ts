import { PrismaClient } from '@prisma/client';

const isVercel = Boolean(process.env.VERCEL);
const isLocalhostUrl = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost'));

if (!process.env.DATABASE_URL || (isVercel && isLocalhostUrl)) {
  process.env.DATABASE_URL =
    process.env.DATABASE_URL_POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL_DATABASE_URL ||
    process.env.storage_POSTGRES_PRISMA_URL ||
    process.env.storage_DATABASE_URL ||
    process.env.DATABASE_URL;
}
if (!process.env.DIRECT_URL || (isVercel && isLocalhostUrl)) {
  process.env.DIRECT_URL =
    process.env.DATABASE_URL_POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.storage_POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL;
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const resolvedUrl = process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: resolvedUrl ? { db: { url: resolvedUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
