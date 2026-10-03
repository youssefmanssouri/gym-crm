import { Prisma } from '@prisma/client';
import { prisma } from './db';

export interface AuditActor {
  id?: string | null;
  email: string;
  role: string;
}

export interface RecordAuditLogParams {
  actor: AuditActor;
  action: string;
  entity: string;
  details: string | Record<string, unknown>;
  ipAddress?: string | null;
  tx?: Prisma.TransactionClient;
}

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /cookie/i,
  /authorization/i,
  /hash/i,
];

export function sanitizeAuditData<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeAuditData(item)) as unknown as T;
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeAuditData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
}

export function extractClientIp(request?: Request): string {
  if (!request) return '127.0.0.1';
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const first = xForwardedFor.split(',')[0].trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

/**
 * Records an AuditLog entry in PostgreSQL.
 * If a transaction client `tx` is provided, the log is created atomically within that transaction.
 * If no `tx` is provided, it creates the log via the main prisma client, failing safely
 * without interrupting the primary operation unless an unhandled error is thrown inside `tx`.
 */
export async function recordAuditLog({
  actor,
  action,
  entity,
  details,
  ipAddress = '127.0.0.1',
  tx,
}: RecordAuditLogParams) {
  let detailsString: string;
  if (typeof details === 'string') {
    // Sanitize any potential accidental embedded secrets in raw strings
    detailsString = details
      .replace(/Bearer\s+[A-Za-z0-9\-_.]+/gi, 'Bearer [REDACTED]')
      .replace(/password\s*[:=]\s*["']?[^"',\s}]+/gi, 'password=[REDACTED]');
  } else {
    try {
      detailsString = JSON.stringify(sanitizeAuditData(details));
    } catch {
      detailsString = String(details);
    }
  }

  const logData = {
    userId: actor.id || null,
    userEmail: actor.email,
    userRole: actor.role,
    action,
    entity,
    details: detailsString,
    ipAddress: ipAddress || '127.0.0.1',
  };

  if (tx) {
    return await tx.auditLog.create({
      data: logData,
    });
  }

  try {
    return await prisma.auditLog.create({
      data: logData,
    });
  } catch (err) {
    console.error(`[AUDIT_ERROR] Failed to record audit log (${action} on ${entity}):`, err);
    return null;
  }
}
