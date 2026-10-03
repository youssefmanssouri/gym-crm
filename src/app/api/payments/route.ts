import { NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth-server';
import { prisma } from '@/lib/db';
import { createPaymentSchema } from '@/lib/validations';
import { PaymentRecord } from '@/lib/types';
import { recordAuditLog, extractClientIp } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAuth();

    const [payments, aggregateCompleted, aggregatePending, countRefunded, totalCount] = await Promise.all([
      prisma.payment.findMany({
        include: {
          user: true,
          membership: {
            include: { plan: true },
          },
          orderItems: {
            include: { product: true },
          },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'PENDING' },
      }),
      prisma.payment.count({
        where: { status: 'REFUNDED' },
      }),
      prisma.payment.count(),
    ]);

    const formattedPayments: PaymentRecord[] = payments.map((p) => ({
      id: p.id,
      userId: p.userId,
      userName: p.user.name,
      userEmail: p.user.email,
      membershipPlanName: p.membership?.plan.name || 'Manual Fee',
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      status: p.status,
      invoiceNumber: p.invoiceNumber,
      description: p.description || 'Payment Transaction',
      date: p.date.toLocaleString(),
      orderItems: p.orderItems?.map((oi) => ({
        id: oi.id,
        paymentId: oi.paymentId,
        productId: oi.productId,
        productName: oi.product.name,
        quantity: oi.quantity,
        unitPrice: oi.unitPrice,
        createdAt: oi.createdAt.toISOString().slice(0, 10),
      })),
    }));

    const totalRevenue = aggregateCompleted._sum.amount || 0;
    const pendingAmount = aggregatePending._sum.amount || 0;
    const refundRate = totalCount > 0 ? ((countRefunded / totalCount) * 100).toFixed(1) : '0.0';

    return NextResponse.json({
      success: true,
      payments: formattedPayments,
      total: formattedPayments.length,
      aggregates: {
        totalRevenue,
        pendingAmount,
        refundRate: `${refundRate}%`,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to retrieve payments from database:', error);
    return NextResponse.json(
      { success: false, error: 'Database service unavailable. Failed to retrieve payment ledger.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await requireRole(['ADMIN', 'MANAGER', 'RECEPTIONIST']);
    const ipAddress = extractClientIp(request);

    const body = await request.json().catch(() => null);
    const parsed = createPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { userId, memberEmail, memberName, amount, paymentMethod, description, membershipId } = parsed.data;

    let targetUserId = userId;

    // If userId not provided, try to find by email
    if (!targetUserId && memberEmail) {
      const user = await prisma.user.findUnique({
        where: { email: memberEmail.toLowerCase() },
      });
      if (user) targetUserId = user.id;
    }

    // If still not found, create a walk-in user record or attribute to current staff with description
    if (!targetUserId) {
      if (memberEmail && memberName) {
        const newUser = await prisma.user.create({
          data: {
            email: memberEmail.toLowerCase(),
            name: memberName,
            passwordHash: 'WALK_IN_UNSET',
            role: 'MEMBER',
            status: 'ACTIVE',
          },
        });
        targetUserId = newUser.id;
      } else {
        targetUserId = authUser.id;
      }
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newPayment = await prisma.payment.create({
      data: {
        userId: targetUserId,
        membershipId: membershipId || undefined,
        amount,
        paymentMethod,
        status: 'COMPLETED',
        invoiceNumber,
        description: description || 'Gym Fee Payment',
        date: new Date(),
      },
      include: {
        user: true,
        membership: { include: { plan: true } },
      },
    });

    await recordAuditLog({
      actor: authUser,
      action: 'CREATE_PAYMENT',
      entity: 'Payment',
      details: `Processed ${paymentMethod} payment of $${amount} for ${newPayment.user.name} (${newPayment.user.email}). Invoice: ${invoiceNumber}, Payment ID: ${newPayment.id}`,
      ipAddress,
    });

    const formatted: PaymentRecord = {
      id: newPayment.id,
      userId: newPayment.userId,
      userName: newPayment.user.name,
      userEmail: newPayment.user.email,
      membershipPlanName: newPayment.membership?.plan.name || 'Walk-in Payment',
      amount: newPayment.amount,
      paymentMethod: newPayment.paymentMethod,
      status: newPayment.status,
      invoiceNumber: newPayment.invoiceNumber,
      description: newPayment.description || '',
      date: newPayment.date.toLocaleString(),
    };

    return NextResponse.json(
      {
        success: true,
        payment: formatted,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      if (error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    console.error('Error recording payment:', error);
    return NextResponse.json({ success: false, error: 'Failed to record payment' }, { status: 500 });
  }
}
