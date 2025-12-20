import 'dotenv/config';
import { createNodePrismaClient } from '../src/lib/server/prisma.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = await createNodePrismaClient();

// Helper function to generate random dates
function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log('🌫️  Seeding Misty Cove for Spore Test Org...\n');

  // Find Spore Test Org
  const sporeOrg = await prisma.organization.findUnique({
    where: { name: 'Spore Test Org' }
  });

  if (!sporeOrg) {
    console.error('❌ Spore Test Org not found!');
    return;
  }

  console.log(`📁 Found: ${sporeOrg.name} (ID: ${sporeOrg.id})`);

  // Create Misty Cove site
  console.log('\n🏢 Creating Misty Cove site...');
  const mistyCoveSite = await prisma.site.create({
    data: {
      name: 'Misty Cove',
      address: '123 Misty Lane',
      city: 'Coastal City',
      state: 'CA',
      zipCode: '90210',
      country: 'USA',
      phoneNumber: '(555) 123-4567',
      organizationId: sporeOrg.id,
    },
  });
  console.log(`  ✅ Created: ${mistyCoveSite.name}`);

  // Create Main building
  console.log('\n🏠 Creating Main building...');
  const mainBuilding = await prisma.building.create({
    data: {
      name: 'Main',
      description: 'Primary building for Misty Cove',
      address: '123 Misty Lane',
      city: 'Coastal City',
      state: 'CA',
      zipCode: '90210',
      country: 'USA',
      yearBuilt: 2010,
      floors: 3,
      squareFeet: 50000,
      siteId: mistyCoveSite.id,
    },
  });
  console.log(`  ✅ Created: ${mainBuilding.name}`);

  // Create units
  console.log('\n🚪 Creating units...');
  const units = [];

  // Numbered units 101-133
  for (let i = 101; i <= 133; i++) {
    units.push({
      id: uuidv4(),
      roomNumber: i.toString(),
      name: 'Residential Unit',
      floor: i < 200 ? 1 : i < 300 ? 2 : 3,
      squareFeet: 800 + Math.floor(Math.random() * 400),
      description: `Residential unit ${i}`,
      siteId: mistyCoveSite.id,
      buildingId: mainBuilding.id,
    });
  }

  // Special units
  units.push({
    id: uuidv4(),
    roomNumber: 'OFF-001',
    name: 'Office',
    floor: 1,
    squareFeet: 500,
    description: 'Main office',
    siteId: mistyCoveSite.id,
    buildingId: mainBuilding.id,
  });

  units.push({
    id: uuidv4(),
    roomNumber: 'LIB-001',
    name: 'Library',
    floor: 2,
    squareFeet: 1500,
    description: 'Community library',
    siteId: mistyCoveSite.id,
    buildingId: mainBuilding.id,
  });

  for (let i = 1; i <= 3; i++) {
    units.push({
      id: uuidv4(),
      roomNumber: `STO-${String(i).padStart(3, '0')}`,
      name: 'Storage',
      floor: 1,
      squareFeet: 100,
      description: `Storage unit ${i}`,
      siteId: mistyCoveSite.id,
      buildingId: mainBuilding.id,
    });
  }

  units.push({
    id: uuidv4(),
    roomNumber: 'MECH-001',
    name: 'Mech Room',
    floor: -1,
    squareFeet: 2000,
    description: 'Mechanical room with HVAC systems',
    siteId: mistyCoveSite.id,
    buildingId: mainBuilding.id,
  });

  await prisma.unit.createMany({ data: units });
  console.log(`  ✅ Created ${units.length} units`);

  // Get all created units for reference
  const createdUnits = await prisma.unit.findMany({
    where: { siteId: mistyCoveSite.id }
  });

  // Create assets for numbered units (101-133)
  console.log('\n📦 Creating assets for numbered units...');
  const assets = [];
  const numberedUnits = createdUnits.filter(u =>
    !isNaN(parseInt(u.roomNumber)) &&
    parseInt(u.roomNumber) >= 101 &&
    parseInt(u.roomNumber) <= 133
  );

  const assetTypes = [
    { name: 'Fridge', type: 'OTHER' },
    { name: 'Heater', type: 'HVAC' },
    { name: 'Wall AC', type: 'HVAC' },
    { name: 'Oven', type: 'OTHER' }
  ];

  for (const unit of numberedUnits) {
    for (const asset of assetTypes) {
      assets.push({
        id: uuidv4(),
        name: `${unit.roomNumber} - ${asset.name}`,
        description: `${asset.name} in unit ${unit.roomNumber}`,
        type: asset.type as any,
        status: 'OPERATIONAL' as any,
        purchaseDate: randomDate(new Date(2010, 0, 1), new Date(2023, 0, 1)),
        warrantyExpiry: randomDate(new Date(2024, 0, 1), new Date(2028, 0, 1)),
        lastMaintenance: Math.random() > 0.5 ? randomDate(new Date(2023, 0, 1), new Date()) : null,
        siteId: mistyCoveSite.id,
        unitId: unit.id,
      });
    }
  }

  await prisma.asset.createMany({ data: assets });
  console.log(`  ✅ Created ${assets.length} assets`);

  // Get users for work order assignment
  const users = await prisma.user.findMany({
    where: { organizationId: sporeOrg.id, isActive: true }
  });

  if (users.length === 0) {
    console.log('⚠️  No users found. Creating a default technician...');
    const hashedPassword = await bcrypt.hash('tech123456', 10);
    const techUser = await prisma.user.create({
      data: {
        email: 'tech@sporecmms.com',
        password: hashedPassword,
        firstName: 'Tech',
        lastName: 'User',
        role: 'TECHNICIAN',
        organizationId: sporeOrg.id,
        isActive: true,
      },
    });
    users.push(techUser);
  }

  // Create work orders
  console.log('\n📋 Creating work orders...');
  const workOrderTitles = [
    'Preventive Maintenance Check',
    'Annual Inspection',
    'Filter Replacement',
    'Temperature Not Cooling',
    'Unusual Noise Complaint',
    'Emergency Repair',
    'Routine Service',
    'Safety Inspection',
    'Performance Test',
    'Leak Detection'
  ];

  const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH'];

  for (let i = 0; i < 10; i++) {
    const randomAsset = assets[Math.floor(Math.random() * assets.length)];
    const title = workOrderTitles[Math.floor(Math.random() * workOrderTitles.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
    const priority = priorities[Math.floor(Math.random() * priorities.length)] as any;
    const assignedUser = users[Math.floor(Math.random() * users.length)];

    const createdAt = randomDate(new Date(2024, 0, 1), new Date());
    const completedAt = status === 'COMPLETED' ? randomDate(createdAt, new Date()) : null;
    const dueDate = randomDate(createdAt, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

    await prisma.workOrder.create({
      data: {
        title,
        description: `Perform ${title.toLowerCase()} on ${randomAsset.name}. Please ensure all safety protocols are followed and document any findings.`,
        priority,
        status,
        dueDate,
        completedAt,
        createdAt,
        updatedAt: new Date(),
        assetId: randomAsset.id,
        unitId: randomAsset.unitId,
        buildingId: mainBuilding.id,
        siteId: mistyCoveSite.id,
        createdById: users[0].id,
        assignedToId: Math.random() > 0.3 ? assignedUser.id : null,
        organizationId: sporeOrg.id,
      },
    });
  }

  console.log('  ✅ Created 10 work orders');

  // Create work order events
  const createdWorkOrders = await prisma.workOrder.findMany({
    where: { organizationId: sporeOrg.id },
    select: { id: true, status: true, createdAt: true }
  });

  const events = [];
  for (const wo of createdWorkOrders) {
    events.push({
      id: uuidv4(),
      event: 'CREATED',
      description: 'Work order created',
      createdAt: wo.createdAt,
      workOrderId: wo.id,
      userId: users[0].id,
    });

    if (wo.status === 'IN_PROGRESS') {
      events.push({
        id: uuidv4(),
        event: 'IN_PROGRESS',
        description: 'Work started',
        createdAt: new Date(wo.createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        workOrderId: wo.id,
        userId: users[0].id,
      });
    } else if (wo.status === 'COMPLETED') {
      events.push({
        id: uuidv4(),
        event: 'COMPLETED',
        description: 'Work completed successfully',
        createdAt: wo.completedAt,
        workOrderId: wo.id,
        userId: users[0].id,
      });
    }
  }

  await prisma.workOrderEvent.createMany({ data: events });
  console.log(`  ✅ Created ${events.length} work order events`);

  console.log('\n🎉 Misty Cove seeding complete!');
  console.log(`\n📊 Summary:`);
  console.log(`  - Site: 1 (Misty Cove)`);
  console.log(`  - Building: 1 (Main)`);
  console.log(`  - Units: ${units.length}`);
  console.log(`  - Assets: ${assets.length}`);
  console.log(`  - Work Orders: 10`);
  console.log(`  - Work Order Events: ${events.length}`);

  await prisma.$disconnect();
}

main().catch(console.error);