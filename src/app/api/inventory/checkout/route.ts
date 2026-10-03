import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-server';
import { prisma } from '@/lib/db';
import { checkoutProductSchema } from '@/lib/validations';
import { recordAuditLog, extractClientIp } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const authStaff = await requireRole(['ADMIN', 'MANAGER', 'RECEPTIONIST']);
    const ipAddress = extractClientIp(request);

    const body = await request.json().catch(() => null);
    const parsed = checkoutProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid checkout parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { productId, quantity, paymentMethod } = parsed.data;

    try {
      // Atomic transaction for inventory decrement + sales payment ledger record
      const result = await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          throw new Error('NOT_FOUND');
        }

        if (product.stockQuantity < quantity) {
          throw new Error(`INSUFFICIENT_STOCK: Only ${product.stockQuantity} units available.`);
        }

        const updatedProduct = await tx.product.update({
          where: { id: productId },
          data: {
            stockQuantity: { decrement: quantity },
          },
        });

        const totalSaleAmount = product.price * quantity;
        const invoiceNumber = `INV-POS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

        const payment = await tx.payment.create({
          data: {
            userId: authStaff.id,
            amount: totalSaleAmount,
            paymentMethod,
            status: 'COMPLETED',
            invoiceNumber,
            description: `Pro Shop POS Sale: ${product.name} (x${quantity})`,
            date: new Date(),
            orderItems: {
              create: {
                productId: product.id,
                quantity,
                unitPrice: product.price,
              },
            },
          },
        });

        await recordAuditLog({
          actor: authStaff,
          action: 'POS_CHECKOUT',
          entity: 'Product',
          details: `Sold ${quantity} unit(s) of "${product.name}" (SKU: ${product.sku}) for $${totalSaleAmount}. Invoice: ${invoiceNumber}`,
          ipAddress,
          tx,
        });

        return {
          product: updatedProduct,
          payment,
        };
      });

      return NextResponse.json({
        success: true,
        message: `Sold ${quantity} unit(s) of ${result.product.name}. Stock is now ${result.product.stockQuantity}.`,
        product: {
          id: result.product.id,
          name: result.product.name,
          category: result.product.category,
          sku: result.product.sku,
          price: result.product.price,
          costPrice: result.product.costPrice,
          stockQuantity: result.product.stockQuantity,
          minStockLevel: result.product.minStockLevel,
          supplier: result.product.supplier || '',
        },
        invoiceNumber: result.payment.invoiceNumber,
      });
    } catch (dbError: unknown) {
      if (dbError instanceof Error) {
        if (dbError.message === 'NOT_FOUND') {
          return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }
        if (dbError.message.startsWith('INSUFFICIENT_STOCK:')) {
          return NextResponse.json({ success: false, error: dbError.message }, { status: 400 });
        }
      }

      console.error('POS checkout database transaction failed:', dbError);
      return NextResponse.json(
        { success: false, error: 'Database transaction error: POS checkout could not be completed.' },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      if (error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    console.error('POS checkout error:', error);
    return NextResponse.json({ success: false, error: 'Transaction failed' }, { status: 500 });
  }
}

