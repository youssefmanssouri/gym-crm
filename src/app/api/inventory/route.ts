import { NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth-server';
import { prisma } from '@/lib/db';
import { createProductSchema } from '@/lib/validations';
import { ProductItem } from '@/lib/types';
import { recordAuditLog, extractClientIp } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAuth();

    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
    });

    const formatted: ProductItem[] = products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      sku: p.sku,
      price: p.price,
      costPrice: p.costPrice,
      stockQuantity: p.stockQuantity,
      minStockLevel: p.minStockLevel,
      supplier: p.supplier || 'Apex Logistics',
    }));

    return NextResponse.json({
      success: true,
      products: formatted,
      total: formatted.length,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to retrieve inventory catalog from database:', error);
    return NextResponse.json(
      { success: false, error: 'Database service unavailable. Failed to retrieve inventory catalog.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await requireRole(['ADMIN', 'MANAGER']);
    const ipAddress = extractClientIp(request);

    const body = await request.json().catch(() => null);
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, category, sku, price, costPrice, stockQuantity, minStockLevel, supplier } = parsed.data;

    // Check SKU collision
    const existing = await prisma.product.findUnique({
      where: { sku },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Product SKU '${sku}' already exists.` },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        category,
        sku,
        price,
        costPrice: costPrice ?? price * 0.6,
        stockQuantity,
        minStockLevel,
        supplier,
      },
    });

    await recordAuditLog({
      actor: authUser,
      action: 'CREATE_PRODUCT',
      entity: 'Product',
      details: `Created product "${product.name}" (SKU: ${product.sku}, Stock: ${product.stockQuantity}, Price: $${product.price}, ID: ${product.id})`,
      ipAddress,
    });

    const formatted: ProductItem = {
      id: product.id,
      name: product.name,
      category: product.category,
      sku: product.sku,
      price: product.price,
      costPrice: product.costPrice,
      stockQuantity: product.stockQuantity,
      minStockLevel: product.minStockLevel,
      supplier: product.supplier || '',
    };

    return NextResponse.json(
      {
        success: true,
        product: formatted,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      if (error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}
