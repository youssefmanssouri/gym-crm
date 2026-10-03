const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || process.env.DIRECT_URL,
    },
  },
});

async function main() {
  console.log('[SEED] Checking cloud database initial records...');

  const adminEmail = 'alex.admin@apexfitness.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    console.log('[SEED] Creating default administrator account...');
    const adminPass = process.env.ADMIN_PASSWORD || 'ApexAdmin2026!';
    const passwordHash = bcrypt.hashSync(adminPass, 10);
    await prisma.user.create({
      data: {
        id: 'usr-admin-1',
        email: adminEmail,
        passwordHash,
        name: 'Alex Vance',
        role: 'ADMIN',
        status: 'ACTIVE',
        phone: '+1 (555) 019-2834',
        bio: 'Founder & Managing Director of Apex Fitness Club.',
      },
    });
    console.log('[SEED] Default administrator account created.');
  } else {
    console.log('[SEED] Administrator account already exists.');
  }

  // Ensure legacy Unsplash placeholder URLs are cleaned
  const cleanedAvatars = await prisma.user.updateMany({
    where: { avatar: { contains: 'unsplash' } },
    data: { avatar: null },
  });
  if (cleanedAvatars.count > 0) {
    console.log(`[SEED] Cleaned ${cleanedAvatars.count} legacy Unsplash avatar URLs in cloud database.`);
  }

  // Ensure standard plans exist
  const plans = [
    {
      id: 'plan-basic',
      name: 'Standard Monthly',
      description: 'Full gym access, standard locker room & cardio deck.',
      durationMonths: 1,
      price: 59.0,
      type: 'MONTHLY',
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
      type: 'QUARTERLY',
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
      type: 'VIP',
      features: '24/7 Keycard Access, Unlimited Group Classes, Monthly PT Assessment, Towel Service, 15% Off Pro Shop',
      isPopular: false,
      isActive: true,
    },
  ];

  for (const p of plans) {
    await prisma.membershipPlan.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  // Ensure standard products exist
  const products = [
    {
      id: 'prod-1',
      name: '100% Whey Isolate Protein (Chocolate 2kg)',
      category: 'SUPPLEMENT',
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
      category: 'SUPPLEMENT',
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
      category: 'DRINK',
      sku: 'DRK-ELECTRO-01',
      price: 4.5,
      costPrice: 1.8,
      stockQuantity: 64,
      minStockLevel: 15,
      supplier: 'Apex Fuel Beverage Co.',
    },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: prod,
    });
  }

  console.log('[SEED] Cloud database seed check completed.');
}

main()
  .catch((err) => {
    console.error('[SEED] Warning during seed check:', err.message);
  })
  .finally(() => prisma.$disconnect());
