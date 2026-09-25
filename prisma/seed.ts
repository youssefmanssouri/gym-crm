import { PrismaClient, UserRole, UserStatus, PlanType, MembershipStatus, PaymentMethod, PaymentStatus, ProductCategory, CheckInMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Apex Gym CRM PostgreSQL database...');

  const adminPass = process.env.ADMIN_PASSWORD || 'ApexAdmin2026!';
  const staffPass = process.env.STAFF_PASSWORD || 'ApexStaff2026!';
  const memberPass = 'ApexMember2026!';

  const adminHash = bcrypt.hashSync(adminPass, 10);
  const staffHash = bcrypt.hashSync(staffPass, 10);
  const memberHash = bcrypt.hashSync(memberPass, 10);

  // 1. Core System Accounts
  const usersToSeed = [
    {
      id: 'usr-admin-1',
      email: 'alex.admin@apexfitness.com',
      passwordHash: adminHash,
      name: 'Alex Vance',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
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
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
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
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
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
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
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
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      phone: '+1 (555) 017-7722',
      bio: 'Avid powerlifter targeting a 500lb deadlift.',
    },
  ];

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
