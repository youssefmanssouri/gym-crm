import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-server';
import { prisma } from '@/lib/db';
import { updateProductSchema } from '@/lib/validations';
import { recordAuditLog, extractClientIp } from '@/lib/audit';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const authUser = await requireRole(['ADMIN', 'MANAGER']);
    const ipAddress = extractClientIp(request);
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await prisma.product.update({
      where: { id },
      data: parsed.data,
    });

    await recordAuditLog({
      actor: authUser,
      action: 'UPDATE_PRODUCT',
      entity: 'Product',
      details: `Updated product "${updated.name}" (ID: ${id}). Changes: ${Object.keys(parsed.data).join(', ')}`,
      ipAddress,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      if (error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: 'Product update failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const authUser = await requireRole(['ADMIN']);
    const ipAddress = extractClientIp(request);
    const { id } = await params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id },
    });

    await recordAuditLog({
      actor: authUser,
      action: 'DELETE_PRODUCT',
      entity: 'Product',
      details: `Deleted product "${existing.name}" (SKU: ${existing.sku}, ID: ${id})`,
      ipAddress,
    });

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      if (error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: 'Product deletion failed' }, { status: 500 });
  }
}
