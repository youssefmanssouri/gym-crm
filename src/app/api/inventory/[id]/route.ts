import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-server';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    await requireRole(['ADMIN', 'MANAGER']);
    const { id } = params;
    const body = await request.json().catch(() => ({}));

    const updated = await prisma.product.update({
      where: { id },
      data: {
        price: typeof body.price === 'number' ? body.price : undefined,
        stockQuantity: typeof body.stockQuantity === 'number' ? body.stockQuantity : undefined,
        minStockLevel: typeof body.minStockLevel === 'number' ? body.minStockLevel : undefined,
      },
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
    await requireRole(['ADMIN']);
    const { id } = params;

    await prisma.product.delete({
      where: { id },
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
