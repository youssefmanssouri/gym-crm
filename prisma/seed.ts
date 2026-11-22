import { PrismaClient, UserRole, UserStatus, PlanType, MembershipStatus, PaymentMethod, PaymentStatus, ProductCategory, CheckInMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Apex Gym CRM PostgreSQL database...');
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  const adminPass = process.env.ADMIN_PASSWORD;
  const staffPass = process.env.STAFF_PASSWORD;
  const memberPass = process.env.MEMBER_PASSWORD;

  if (isProduction && (!adminPass || !staffPass || !memberPass)) {
    throw new Error(
      'SECURITY ERROR: Seeding in production requires explicit ADMIN_PASSWORD, STAFF_PASSWORD, and MEMBER_PASSWORD environment variables. Silent fallback credentials are strictly prohibited.'
    );
  }

  // Local development credential resolution
  let effectiveAdminPass = adminPass;
  let effectiveStaffPass = staffPass;
  let effectiveMemberPass = memberPass;

  if (!effectiveAdminPass || !effectiveStaffPass || !effectiveMemberPass) {
    if (process.env.ALLOW_DEV_CREDENTIALS === 'true' || process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      console.warn('⚠️  NOTICE: Using local development credentials for seed. Set ADMIN_PASSWORD and STAFF_PASSWORD in .env for production.');
      effectiveAdminPass = effectiveAdminPass || 'DevAdminDefaultPass!';
      effectiveStaffPass = effectiveStaffPass || 'DevStaffDefaultPass!';
      effectiveMemberPass = effectiveMemberPass || 'DevMemberDefaultPass!';
    } else {
      throw new Error(
        'Missing seed credentials. Please provide ADMIN_PASSWORD, STAFF_PASSWORD, and MEMBER_PASSWORD environment variables, or set ALLOW_DEV_CREDENTIALS=true for intentional local development.'
      );
    }
  }

  const adminHash = bcrypt.hashSync(effectiveAdminPass, 10);
  const staffHash = bcrypt.hashSync(effectiveStaffPass, 10);
  const memberHash = bcrypt.hashSync(effectiveMemberPass, 10);

  // 1. Core System Accounts
  const usersToSeed = [
    {
      id: 'usr-admin-1',
      email: 'alex.admin@apexfitness.com',
      passwordHash: adminHash,
      name: 'Alex Vance',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      avatar: null,
      phone: '+1 (555) 019-2834',
      bio: 'Founder & Managing Director of Apex Fitness Club.',
    },
    {
      id: 'usr-mgr-1',
      email: 'marcus.manager@apexfitness.com',
      passwordHash: staffHash,
      name: 'Marcus Vance',
      role: UserRole.MANAGER,
      status: UserStatus.ACTIVE,
      avatar: null,
      phone: '+1 (555) 012-9843',
      bio: 'Operations Manager overseeing staff & billing.',
    },
    {
      id: 'usr-trn-1',
      email: 'sarah.trainer@apexfitness.com',
      passwordHash: staffHash,
      name: 'Sarah Stone',
      role: UserRole.TRAINER,
      status: UserStatus.ACTIVE,
      avatar: null,
      phone: '+1 (555) 014-4920',
      bio: 'Head Strength Coach & Certified Personal Trainer.',
    },
    {
      id: 'usr-rec-1',
      email: 'elena.reception@apexfitness.com',
      passwordHash: staffHash,
      name: 'Elena Rostova',
      role: UserRole.RECEPTIONIST,
      status: UserStatus.ACTIVE,
      avatar: null,
      phone: '+1 (555) 018-3829',
      bio: 'Front Desk Coordinator & Member Concierge.',
    },
    {
      id: 'usr-mem-1',
      email: 'david.member@apexfitness.com',
      passwordHash: memberHash,
      name: 'David Chen',
      role: UserRole.MEMBER,
      status: UserStatus.ACTIVE,
      avatar: null,
      phone: '+1 (555) 017-7722',
      bio: 'Avid powerlifter targeting a 500lb deadlift.',
    },
  ];

  // Shared read-only demo account: reached only through /api/auth/demo, so its
  // password is random and never used. The middleware blocks its changes.
  usersToSeed.push({
    id: 'usr-demo-viewer',
    email: 'demo.viewer@apexfitness.com',
    passwordHash: bcrypt.hashSync(randomBytes(32).toString('hex'), 10),
    name: 'Demo Visitor',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    avatar: null,
    phone: '+1 (555) 010-0000',
    bio: 'Shared read-only demo account.',
  });

  for (const u of usersToSeed) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      await prisma.user.create({ data: u });
    } else {
      // Preserve existing passwordHash; do NOT overwrite credentials
      await prisma.user.update({
        where: { email: u.email },
        data: {
          name: u.name,
          role: u.role,
          status: u.status,
          phone: u.phone,
          avatar: u.avatar,
          bio: u.bio,
        },
      });
    }
  }

  // 2. Membership Plans
  const plans = [
    {
      id: 'plan-basic',
      name: 'Standard Monthly',
      description: 'Full gym access, standard locker room & cardio deck.',
      durationMonths: 1,
      price: 59.0,
      type: PlanType.MONTHLY,
      features: 'Full Gym Access, Locker Room Access, Free Wi-Fi, Basic Mobile App Pass',
      isPopular: false,
      isActive: true,
    },
    {
      id: 'plan-quarterly',
      name: 'Quarterly Athlete',
      description: '3 months full access with complimentary sauna & body scans.',
      durationMonths: 3,
      price: 159.0,
      type: PlanType.QUARTERLY,
      features: 'Full Gym Access, Sauna & Recovery Lounge, 1 InBody Scan / Month, Guest Pass x2',
      isPopular: true,
      isActive: true,
    },
    {
      id: 'plan-vip',
      name: 'VIP All-Access Annual',
      description: 'Ultimate membership with 24/7 keycard, unlimited classes & personal trainer session.',
      durationMonths: 12,
      price: 599.0,
      type: PlanType.VIP,
      features: '24/7 Keycard Access, Unlimited Group Classes, Monthly PT Assessment, Towel Service, 15% Off Pro Shop',
      isPopular: false,
      isActive: true,
    },
    {
      id: 'plan-pt-pkg',
      name: 'Personal Training Bundle',
      description: '10 1-on-1 personal training sessions with a Master Coach.',
      durationMonths: 1,
      price: 450.0,
      type: PlanType.PERSONAL_TRAINING,
      features: '10x 1-on-1 Sessions, Custom AI Meal Plan, Weekly Body Composition Analysis, Direct Trainer Chat',
      isPopular: false,
      isActive: true,
    },
  ];

  for (const p of plans) {
    await prisma.membershipPlan.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }

  // 3. Member Profiles & Memberships
  const memberUser = await prisma.user.findUnique({ where: { email: 'david.member@apexfitness.com' } });
  if (memberUser) {
    const profile = await prisma.memberProfile.upsert({
      where: { qrCode: 'APEX-MEMBER-7722' },
      update: {
        userId: memberUser.id,
        gender: 'Male',
        dob: new Date('1994-06-15'),
        heightCm: 178,
        weightKg: 82.5,
        targetWeightKg: 78.0,
        fitnessGoal: 'Hypertrophy & Strength',
        medicalNotes: 'Mild lower back stiffness on heavy deadlifts.',
        emergencyContactName: 'Rachel Chen',
        emergencyContactPhone: '+1 (555) 017-8899',
      },
      create: {
        id: 'mem-profile-1',
        userId: memberUser.id,
        gender: 'Male',
        dob: new Date('1994-06-15'),
        heightCm: 178,
        weightKg: 82.5,
        targetWeightKg: 78.0,
        fitnessGoal: 'Hypertrophy & Strength',
        medicalNotes: 'Mild lower back stiffness on heavy deadlifts.',
        emergencyContactName: 'Rachel Chen',
        emergencyContactPhone: '+1 (555) 017-8899',
        qrCode: 'APEX-MEMBER-7722',
        joinDate: new Date('2025-05-01'),
      },
    });

    const activeSub = await prisma.memberMembership.findFirst({
      where: { memberId: profile.id },
    });

    if (!activeSub) {
      await prisma.memberMembership.create({
        data: {
          id: 'sub-mem-1',
          memberId: profile.id,
          planId: 'plan-quarterly',
          startDate: new Date('2026-08-01'),
          endDate: new Date('2026-11-01'),
          status: MembershipStatus.ACTIVE,
          autoRenew: true,
          pricePaid: 159.0,
        },
      });
    }

    // Initial Payment
    const existingPayment = await prisma.payment.findUnique({ where: { invoiceNumber: 'INV-2026-8821' } });
    if (!existingPayment) {
      await prisma.payment.create({
        data: {
          id: 'pay-seed-1',
          userId: memberUser.id,
          amount: 159.0,
          paymentMethod: PaymentMethod.CARD,
          status: PaymentStatus.COMPLETED,
          invoiceNumber: 'INV-2026-8821',
          description: 'Quarterly Athlete Membership Renewal',
          date: new Date('2026-08-01'),
        },
      });
    }

    // Initial Attendance
    const existingAtt = await prisma.attendance.findFirst({ where: { userId: memberUser.id } });
    if (!existingAtt) {
      await prisma.attendance.create({
        data: {
          id: 'att-seed-1',
          userId: memberUser.id,
          checkInTime: new Date(),
          method: CheckInMethod.QR_CODE,
          verifiedBy: 'Elena Rostova',
        },
      });
    }
  }

  // 4. Products / Pro Shop Inventory
  const products = [
    {
      id: 'prod-1',
      name: 'Apex Iso-Whey 2kg (Vanilla)',
      category: ProductCategory.SUPPLEMENT,
      sku: 'SUPP-WHEY-01',
      price: 64.99,
      costPrice: 38.0,
      stockQuantity: 28,
      minStockLevel: 5,
      supplier: 'NutriFit Pro Global',
    },
    {
      id: 'prod-2',
      name: 'Pre-Workout Igniter (Blue Raspberry)',
      category: ProductCategory.SUPPLEMENT,
      sku: 'SUPP-PRE-02',
      price: 39.99,
      costPrice: 20.0,
      stockQuantity: 19,
      minStockLevel: 5,
      supplier: 'NutriFit Pro Global',
    },
    {
      id: 'prod-3',
      name: 'Hydro-Electrolyte Energy Drink 500ml',
      category: ProductCategory.DRINK,
      sku: 'DRK-ELECTRO-01',
      price: 4.5,
      costPrice: 1.8,
      stockQuantity: 64,
      minStockLevel: 15,
      supplier: 'Apex Fuel Beverage Co.',
    },
    {
      id: 'prod-4',
      name: 'Apex Athletic Gym Towel (Black/Cyan)',
      category: ProductCategory.MERCHANDISE,
      sku: 'MERCH-TWL-01',
      price: 18.0,
      costPrice: 7.5,
      stockQuantity: 42,
      minStockLevel: 10,
      supplier: 'Apex Apparel Studio',
    },
    {
      id: 'prod-5',
      name: 'Stainless Steel Shaker 750ml',
      category: ProductCategory.EQUIPMENT,
      sku: 'EQP-SHAKE-01',
      price: 24.99,
      costPrice: 11.0,
      stockQuantity: 15,
      minStockLevel: 5,
      supplier: 'IronGrip Equipment',
    },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: prod,
      create: prod,
    });
  }

  // 5. Sample POS Retail Sale with OrderItem
  if (memberUser) {
    const posInvoice = 'INV-POS-2026-9901';
    const existingPos = await prisma.payment.findUnique({ where: { invoiceNumber: posInvoice } });
    if (!existingPos) {
      await prisma.payment.create({
        data: {
          id: 'pay-pos-seed-1',
          userId: memberUser.id,
          amount: 64.99,
          paymentMethod: PaymentMethod.CARD,
          status: PaymentStatus.COMPLETED,
          invoiceNumber: posInvoice,
          description: 'Pro Shop POS Sale: Apex Iso-Whey 2kg (Vanilla) (x1)',
          date: new Date('2026-08-15'),
          orderItems: {
            create: {
              productId: 'prod-1',
              quantity: 1,
              unitPrice: 64.99,
            },
          },
        },
      });
    }
  }

  // 6. Demo activity for screenshots and the public demo.
  // Every member below is fictional and uses a reserved example domain (RFC 2606).
  // Rows use "demo-" ids; each run deletes and recreates only those rows, so the
  // dates stay relative to the moment the seed runs. Core accounts are untouched.
  await prisma.payment.deleteMany({ where: { id: { startsWith: 'demo-' } } });
  await prisma.user.deleteMany({ where: { id: { startsWith: 'demo-' } } }); // cascades profiles, memberships, attendance, payments

  const DAY = 24 * 60 * 60 * 1000;
  const now = new Date();
  const at = (daysAgo: number, hour: number, minute = 0) => {
    const d = new Date(now.getTime() - daysAgo * DAY);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  const planPrice: Record<string, number> = { 'plan-basic': 59, 'plan-quarterly': 159, 'plan-vip': 599, 'plan-pt-pkg': 450 };
  const planMonths: Record<string, number> = { 'plan-basic': 1, 'plan-quarterly': 3, 'plan-vip': 12, 'plan-pt-pkg': 1 };

  const demoMembers: { name: string; gender: string; goal: string; plan: string; joined: number; status: MembershipStatus; weight: number; target: number }[] = [
    { name: 'Yasmine Ouali', gender: 'Female', goal: 'Weight Loss', plan: 'plan-quarterly', joined: 172, status: MembershipStatus.ACTIVE, weight: 71, target: 64 },
    { name: 'Mehdi Lahlou', gender: 'Male', goal: 'Hypertrophy & Strength', plan: 'plan-vip', joined: 168, status: MembershipStatus.ACTIVE, weight: 84, target: 88 },
    { name: 'Clara Jensen', gender: 'Female', goal: 'Endurance', plan: 'plan-basic', joined: 160, status: MembershipStatus.ACTIVE, weight: 60, target: 58 },
    { name: 'Hamza Bennani', gender: 'Male', goal: 'General Fitness', plan: 'plan-basic', joined: 151, status: MembershipStatus.ACTIVE, weight: 79, target: 75 },
    { name: 'Aya Mansouri', gender: 'Female', goal: 'Toning', plan: 'plan-quarterly', joined: 140, status: MembershipStatus.ACTIVE, weight: 63, target: 60 },
    { name: 'Lucas Martin', gender: 'Male', goal: 'Strength', plan: 'plan-pt-pkg', joined: 133, status: MembershipStatus.ACTIVE, weight: 90, target: 85 },
    { name: 'Salma Idrissi', gender: 'Female', goal: 'Weight Loss', plan: 'plan-basic', joined: 126, status: MembershipStatus.ACTIVE, weight: 77, target: 68 },
    { name: 'Noah Fischer', gender: 'Male', goal: 'Endurance', plan: 'plan-quarterly', joined: 119, status: MembershipStatus.ACTIVE, weight: 72, target: 70 },
    { name: 'Imane Chakir', gender: 'Female', goal: 'General Fitness', plan: 'plan-vip', joined: 112, status: MembershipStatus.ACTIVE, weight: 58, target: 57 },
    { name: 'Adam Rahmani', gender: 'Male', goal: 'Hypertrophy & Strength', plan: 'plan-basic', joined: 104, status: MembershipStatus.ACTIVE, weight: 76, target: 82 },
    { name: 'Julia Novak', gender: 'Female', goal: 'Mobility', plan: 'plan-basic', joined: 97, status: MembershipStatus.ACTIVE, weight: 66, target: 63 },
    { name: 'Othmane Kettani', gender: 'Male', goal: 'Weight Loss', plan: 'plan-quarterly', joined: 90, status: MembershipStatus.ACTIVE, weight: 98, target: 88 },
    { name: 'Lina Haddou', gender: 'Female', goal: 'Toning', plan: 'plan-basic', joined: 82, status: MembershipStatus.ACTIVE, weight: 61, target: 59 },
    { name: 'Ethan Clarke', gender: 'Male', goal: 'Strength', plan: 'plan-quarterly', joined: 74, status: MembershipStatus.ACTIVE, weight: 81, target: 84 },
    { name: 'Rania Sefrioui', gender: 'Female', goal: 'General Fitness', plan: 'plan-basic', joined: 66, status: MembershipStatus.ACTIVE, weight: 67, target: 64 },
    { name: 'Youness Amrani', gender: 'Male', goal: 'Endurance', plan: 'plan-basic', joined: 57, status: MembershipStatus.ACTIVE, weight: 74, target: 72 },
    { name: 'Emma Laurent', gender: 'Female', goal: 'Weight Loss', plan: 'plan-pt-pkg', joined: 49, status: MembershipStatus.ACTIVE, weight: 74, target: 66 },
    { name: 'Karim Fassi', gender: 'Male', goal: 'Hypertrophy & Strength', plan: 'plan-quarterly', joined: 41, status: MembershipStatus.ACTIVE, weight: 78, target: 83 },
    { name: 'Sara Bouzid', gender: 'Female', goal: 'Toning', plan: 'plan-basic', joined: 30, status: MembershipStatus.ACTIVE, weight: 59, target: 57 },
    { name: 'Daniel Price', gender: 'Male', goal: 'General Fitness', plan: 'plan-basic', joined: 22, status: MembershipStatus.ACTIVE, weight: 85, target: 80 },
    { name: 'Nour El Amine', gender: 'Female', goal: 'Endurance', plan: 'plan-basic', joined: 12, status: MembershipStatus.ACTIVE, weight: 62, target: 60 },
    { name: 'Tarik Zouhair', gender: 'Male', goal: 'Weight Loss', plan: 'plan-basic', joined: 140, status: MembershipStatus.EXPIRED, weight: 92, target: 84 },
    { name: 'Hiba Alami', gender: 'Female', goal: 'General Fitness', plan: 'plan-quarterly', joined: 125, status: MembershipStatus.FROZEN, weight: 64, target: 62 },
    { name: 'Marco Bianchi', gender: 'Male', goal: 'Strength', plan: 'plan-basic', joined: 110, status: MembershipStatus.EXPIRED, weight: 83, target: 80 },
  ];

  const shopProducts = await prisma.product.findMany({ orderBy: { sku: 'asc' } });
  const demoUserIds: string[] = [];
  let invoiceSeq = 1;

  for (const [index, m] of demoMembers.entries()) {
    const n = String(index + 1).padStart(2, '0');
    const userId = `demo-user-${n}`;
    const [first, ...rest] = m.name.toLowerCase().split(' ');
    const joinDate = at(m.joined, 10);
    await prisma.user.create({
      data: {
        id: userId,
        email: `${first}.${rest.join('')}@members.example`,
        passwordHash: memberHash,
        name: m.name,
        role: UserRole.MEMBER,
        status: m.status === MembershipStatus.ACTIVE || m.status === MembershipStatus.FROZEN ? UserStatus.ACTIVE : UserStatus.INACTIVE,
        phone: `+212 600-010-${String(100 + index)}`,
        createdAt: joinDate,
      },
    });
    demoUserIds.push(userId);

    const profile = await prisma.memberProfile.create({
      data: {
        id: `demo-profile-${n}`,
        userId,
        gender: m.gender,
        heightCm: m.gender === 'Female' ? 163 + (index % 8) : 172 + (index % 10),
        weightKg: m.weight,
        targetWeightKg: m.target,
        fitnessGoal: m.goal,
        qrCode: `APEX-M-DEMO-${n}`,
        joinDate,
      },
    });

    // Membership history: consecutive periods from the join date until today.
    const months = planMonths[m.plan];
    let start = joinDate;
    let period = 0;
    const stopAt = m.status === MembershipStatus.ACTIVE ? now : at(30 + index, 9);
    while (start <= stopAt) {
      const end = new Date(start);
      end.setMonth(end.getMonth() + months);
      const isCurrent = end > stopAt;
      const membershipId = `demo-sub-${n}-${period}`;
      await prisma.memberMembership.create({
        data: {
          id: membershipId,
          memberId: profile.id,
          planId: m.plan,
          startDate: start,
          endDate: end,
          status: isCurrent ? m.status : MembershipStatus.EXPIRED,
          autoRenew: m.status === MembershipStatus.ACTIVE,
          pricePaid: planPrice[m.plan],
        },
      });
      await prisma.payment.create({
        data: {
          id: `demo-pay-${String(invoiceSeq).padStart(4, '0')}`,
          userId,
          membershipId,
          amount: planPrice[m.plan],
          paymentMethod: index % 3 === 0 ? PaymentMethod.RECURRING : index % 3 === 1 ? PaymentMethod.CARD : PaymentMethod.CASH,
          status: PaymentStatus.COMPLETED,
          invoiceNumber: `INV-DEMO-${String(invoiceSeq).padStart(4, '0')}`,
          description: `Membership: ${m.plan === 'plan-basic' ? 'Standard Monthly' : m.plan === 'plan-quarterly' ? 'Quarterly Athlete' : m.plan === 'plan-vip' ? 'VIP All-Access Annual' : 'Personal Training Bundle'}`,
          date: start,
        },
      });
      invoiceSeq++;
      start = end;
      period++;
    }
  }

  // Pro shop sales across the last six months.
  for (let i = 0; i < 48 && shopProducts.length > 0; i++) {
    const product = shopProducts[i % shopProducts.length];
    const quantity = (i % 4) + 1;
    const buyer = demoUserIds[(i * 7) % demoUserIds.length];
    await prisma.payment.create({
      data: {
        id: `demo-pay-${String(invoiceSeq).padStart(4, '0')}`,
        userId: buyer,
        amount: Math.round(product.price * quantity * 100) / 100,
        paymentMethod: i % 2 === 0 ? PaymentMethod.CARD : PaymentMethod.CASH,
        status: PaymentStatus.COMPLETED,
        invoiceNumber: `INV-POS-DEMO-${String(invoiceSeq).padStart(4, '0')}`,
        description: `Pro Shop POS Sale: ${product.name} (x${quantity})`,
        date: at(Math.floor((i * 175) / 48), 8 + (i % 12), (i * 13) % 60),
        orderItems: { create: { productId: product.id, quantity, unitPrice: product.price } },
      },
    });
    invoiceSeq++;
  }

  // Check-ins over the last 30 days, with morning and evening peaks. Today's
  // check-ins stop at the current hour so nothing is dated in the future.
  const peakHours = [6, 7, 7, 8, 12, 17, 18, 18, 19, 20];
  const activeIds = demoUserIds.filter((_, i) => demoMembers[i].status === MembershipStatus.ACTIVE);
  let attendanceSeq = 1;
  for (let day = 29; day >= 0; day--) {
    const visits = 9 + ((day * 5) % 7);
    for (let v = 0; v < visits; v++) {
      const hour = peakHours[(day + v * 3) % peakHours.length];
      const minute = (v * 11 + day * 7) % 60;
      const checkIn = at(day, hour, minute);
      if (checkIn > now) continue;
      await prisma.attendance.create({
        data: {
          id: `demo-att-${String(attendanceSeq++).padStart(4, '0')}`,
          userId: activeIds[(day * 3 + v) % activeIds.length],
          checkInTime: checkIn,
          checkOutTime: new Date(checkIn.getTime() + (50 + ((v * 17) % 50)) * 60 * 1000),
          method: v % 4 === 0 ? CheckInMethod.RECEPTIONIST : CheckInMethod.QR_CODE,
          verifiedBy: 'Elena Rostova',
        },
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
