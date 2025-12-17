import 'dotenv/config';
import { createNodePrismaClient } from '../src/lib/server/prisma.js';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const prisma = await createNodePrismaClient();

// Production seed configuration
const PRODUCTION_CONFIG = {
  batchSize: 100, // Optimize batch size for production
  maxRetries: 3, // Number of retries for failed operations
  delayBetweenBatches: 100, // ms delay between batches to prevent overload
  skipCleanup: false, // Skip cleanup for production safety
  createAuditLogs: false, // Skip audit logs for production speed
};

// Helper function to generate UUID using crypto module (faster than uuid package)
function generateUUID(): string {
  const bytes = randomBytes(16);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8]! & 0x3f) | 0x80; // variant 10

  return [...bytes].map((b, i) =>
    (i === 6 || i === 8 || i === 4 || i === 16) ? '-' :
    (b! < 16 ? '0' : '') + b!.toString(16)
  ).join('');
}

// Helper function to retry operations
async function withRetry<T>(operation: () => Promise<T>, retries = PRODUCTION_CONFIG.maxRetries): Promise<T> {
  let lastError: Error;

  for (let i = 0; i <= retries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i === retries) {
        throw lastError;
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  throw lastError!;
}

// Helper function to delay execution
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Optimized batch creation function
async function createInBatches<T>(
  createFunction: (data: T[]) => Promise<any>,
  items: T[],
  entityName: string
): Promise<void> {
  const totalBatches = Math.ceil(items.length / PRODUCTION_CONFIG.batchSize);

  for (let i = 0; i < items.length; i += PRODUCTION_CONFIG.batchSize) {
    const batch = items.slice(i, i + PRODUCTION_CONFIG.batchSize);
    const batchNumber = Math.floor(i / PRODUCTION_CONFIG.batchSize) + 1;

    await withRetry(async () => {
      await createFunction(batch);
      console.log(`  ✅ ${entityName} batch ${batchNumber}/${totalBatches} (${batch.length} items)`);
    });

    // Add delay between batches to prevent overwhelming the database
    if (batchNumber < totalBatches) {
      await delay(PRODUCTION_CONFIG.delayBetweenBatches);
    }
  }
}

// Asset templates for faster generation
const ASSET_TEMPLATES = {
  HVAC: ['Central AC Unit', 'Rooftop HVAC', 'Air Handler', 'Heat Pump', 'Furnace'],
  ELECTRICAL: ['Circuit Breaker', 'Electrical Panel', 'Generator', 'UPS System'],
  PLUMBING: ['Water Heater', 'Sump Pump', 'Toilet', 'Sink', 'Faucet'],
  FIRE_SAFETY: ['Fire Extinguisher', 'Smoke Detector', 'Sprinkler System'],
  ELEVATOR: ['Passenger Elevator', 'Freight Elevator', 'Escalator'],
  SECURITY_SYSTEM: ['CCTV Camera', 'Access Control', 'Motion Sensor'],
  OTHER: ['Office Equipment', 'Printer', 'Coffee Machine']
} as const;

// Pre-computed user data for faster creation
const createUserData = (count: number, role: string, domain: string, prefix: string) => {
  const users = [];
  for (let i = 1; i <= count; i++) {
    users.push({
      email: `${prefix}${i}@${domain}`,
      password: '', // Will be hashed in batch
      firstName: `User${i}`,
      lastName: prefix.charAt(0).toUpperCase() + prefix.slice(1),
      role: role as any,
      isActive: true,
    });
  }
  return users;
};

async function main() {
  console.log('🚀 Starting PRODUCTION database seeding...\n');
  console.log(`⚙️  Configuration:`);
  console.log(`  - Batch size: ${PRODUCTION_CONFIG.batchSize}`);
  console.log(`  - Max retries: ${PRODUCTION_CONFIG.maxRetries}`);
  console.log(`  - Skip cleanup: ${PRODUCTION_CONFIG.skipCleanup}\n`);

  const startTime = Date.now();

  // Clean up existing data (only if configured)
  if (!PRODUCTION_CONFIG.skipCleanup) {
    console.log('🧹 Cleaning up existing data...');
    await withRetry(() => prisma.auditLog.deleteMany());
    await withRetry(() => prisma.workOrderEvent.deleteMany());
    await withRetry(() => prisma.workOrder.deleteMany());
    await withRetry(() => prisma.asset.deleteMany());
    await withRetry(() => prisma.unit.deleteMany());
    await withRetry(() => prisma.building.deleteMany());
    await withRetry(() => prisma.site.deleteMany());
    await withRetry(() => prisma.user.deleteMany());
    await withRetry(() => prisma.organization.deleteMany());
    console.log('✅ Database cleaned\n');
  }

  // ========================================
  // ORGANIZATION 1: Spore Test Org
  // ========================================
  console.log('📁 Creating Organization 1: Spore Test Org');

  const sporeOrg = await withRetry(() => prisma.organization.create({
    data: { name: 'Spore Test Org' },
  }));
  console.log(`  ✅ Created: ${sporeOrg.name} (ID: ${sporeOrg.id})`);

  // Hash password once for efficiency
  const hashedPassword = await bcrypt.hash('admin123456', 10);

  // Create owner for Spore Test Org
  const sporeOwner = await withRetry(() => prisma.user.create({
    data: {
      email: 'zack@sporecmms.com',
      password: hashedPassword,
      firstName: 'Zack',
      lastName: 'Spore',
      role: 'ADMIN',
      organizationId: sporeOrg.id,
      isActive: true,
    },
  }));
  console.log(`  👤 Created owner: ${sporeOwner.email}`);

  // Create Misty Cove site
  console.log('  🏢 Creating site: Misty Cove');
  const mistyCoveSite = await withRetry(() => prisma.site.create({
    data: {
      name: 'Misty Cove',
      address: '123 Ocean View Drive',
      city: 'Seaside',
      state: 'CA',
      zipCode: '92625',
      country: 'USA',
      phoneNumber: '(949) 555-0100',
      organizationId: sporeOrg.id,
    },
  }));
  console.log(`    ✅ Created: ${mistyCoveSite.name}`);

  // Create Building for Misty Cove
  const mainBuilding = await withRetry(() => prisma.building.create({
    data: {
      name: 'Main Building',
      description: 'Primary hotel building',
      address: '123 Ocean View Drive',
      city: 'Seaside',
      state: 'CA',
      zipCode: '92625',
      yearBuilt: 2010,
      floors: 4,
      squareFeet: 50000,
      siteId: mistyCoveSite.id,
    },
  }));

  // Pre-generate all units for Misty Cove
  console.log('  🚪 Preparing units for Misty Cove (38 total)...');
  const mistyCoveUnits = [];

  // Standard rooms 101-133
  for (let i = 101; i <= 133; i++) {
    mistyCoveUnits.push({
      id: generateUUID(),
      roomNumber: i.toString(),
      name: `Room ${i}`,
      floor: Math.floor(i / 100) || 1,
      squareFeet: 250 + Math.floor(Math.random() * 100),
      description: `Standard hotel room with king bed and ocean view`,
      siteId: mistyCoveSite.id,
      buildingId: mainBuilding.id,
    });
  }

  // Special rooms
  const specialRooms = [
    { roomNumber: 'OFFICE-001', name: 'Front Office', floor: 1, sqft: 500, desc: 'Main reception and administrative office' },
    { roomNumber: 'LOBBY-001', name: 'Main Lobby', floor: 1, sqft: 2000, desc: 'Spacious lobby with seating area' },
    { roomNumber: 'LIB-001', name: 'Library', floor: 2, sqft: 300, desc: 'Quiet reading room' },
    { roomNumber: 'STOR-001', name: 'Storage Room A', floor: 1, sqft: 200, desc: 'General storage for supplies' },
    { roomNumber: 'STOR-002', name: 'Storage Room B', floor: 4, sqft: 150, desc: 'Storage for cleaning equipment' },
    { roomNumber: 'MECH-001', name: 'Mechanical Room', floor: -1, sqft: 400, desc: 'HVAC and mechanical equipment' },
    { roomNumber: 'REST-001', name: 'Public Restroom', floor: 1, sqft: 100, desc: 'Public restroom near lobby' },
  ];

  for (const room of specialRooms) {
    mistyCoveUnits.push({
      id: generateUUID(),
      roomNumber: room.roomNumber,
      name: room.name,
      floor: room.floor,
      squareFeet: room.sqft,
      description: room.desc,
      siteId: mistyCoveSite.id,
      buildingId: mainBuilding.id,
    });
  }

  await createInBatches(
    (data) => prisma.unit.createMany({ data }),
    mistyCoveUnits,
    'Misty Cove units'
  );

  // ========================================
  // ORGANIZATION 2: Random Data Corp
  // ========================================
  console.log('\n📁 Creating Organization 2: Random Data Corp');

  const randomCorpOrg = await withRetry(() => prisma.organization.create({
    data: { name: 'Random Data Corp' },
  }));
  console.log(`  ✅ Created: ${randomCorpOrg.name} (ID: ${randomCorpOrg.id})`);

  // Hash password once for efficiency
  const hashedPassword2 = await bcrypt.hash('password123', 10);

  // Create all users in batch
  console.log('  👥 Creating all users...');
  const allUsers = [
    // Owner
    { email: 'owner@randomdatacorp.com', password: hashedPassword2, firstName: 'Robert', lastName: 'Anderson', role: 'ADMIN' },
    // Managers
    ...createUserData(5, 'MANAGER', 'randomdatacorp.com', 'manager'),
    // Technicians
    ...createUserData(40, 'TECHNICIAN', 'randomdatacorp.com', 'tech'),
    // Read-only users (using TECHNICIAN role)
    ...createUserData(5, 'TECHNICIAN', 'randomdatacorp.com', 'readonly'),
  ];

  // Add organizationId to all users
  allUsers.forEach(user => {
    (user as any).organizationId = randomCorpOrg.id;
    (user as any).id = generateUUID();
  });

  await createInBatches(
    (data) => prisma.user.createMany({ data }),
    allUsers,
    'Random Data Corp users'
  );

  // Get created users for reference
  const createdUsers = await withRetry(() => prisma.user.findMany({
    where: { organizationId: randomCorpOrg.id },
    select: { id: true, email: true, role: true }
  }));

  const managers = createdUsers.filter(u => u.email.includes('manager'));
  const technicians = createdUsers.filter(u => u.email.includes('tech') && !u.email.includes('readonly'));

  // Create Industrial Complex site
  console.log('\n  🏭 Creating Industrial Complex...');
  const industrialSite = await withRetry(() => prisma.site.create({
    data: {
      name: 'Industrial Complex',
      address: '456 Manufacturing Boulevard',
      city: 'Industrial City',
      state: 'TX',
      zipCode: '75201',
      country: 'USA',
      phoneNumber: '(214) 555-0200',
      organizationId: randomCorpOrg.id,
    },
  }));

  // Create buildings for Industrial Complex
  const industrialBuildings = [];
  for (let i = 1; i <= 5; i++) {
    industrialBuildings.push({
      id: generateUUID(),
      name: `Building ${String.fromCharCode(64 + i)}`,
      description: `Manufacturing and warehouse building ${i}`,
      address: `${456 + i} Manufacturing Boulevard`,
      city: 'Industrial City',
      state: 'TX',
      zipCode: '75201',
      yearBuilt: 2000 + i * 2,
      floors: i === 1 ? 3 : 1,
      squareFeet: 50000 + (i * 10000),
      siteId: industrialSite.id,
    });
  }

  await createInBatches(
    (data) => prisma.building.createMany({ data }),
    industrialBuildings,
    'Industrial Complex buildings'
  );

  // Pre-generate all units for Industrial Complex
  console.log('  🚪 Generating units for Industrial Complex...');
  const industrialUnits = [];
  const roomTypes = ['Production Area', 'Storage', 'Office', 'Break Room', 'Quality Control', 'Loading Dock', 'Workshop', 'Lab'];

  for (const building of industrialBuildings) {
    const numFloors = building.floors || 1;
    for (let floor = 1; floor <= numFloors; floor++) {
      const roomsPerFloor = floor === 1 ? 25 : 15;
      for (let i = 1; i <= roomsPerFloor; i++) {
        const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];

        industrialUnits.push({
          id: generateUUID(),
          roomNumber: `${building.name}-${floor}${String(i).padStart(2, '0')}`,
          name: roomType,
          floor,
          squareFeet: 200 + Math.floor(Math.random() * 800),
          description: `${roomType} in ${building.name}`,
          siteId: industrialSite.id,
          buildingId: building.id,
        });
      }
    }
  }

  await createInBatches(
    (data) => prisma.unit.createMany({ data }),
    industrialUnits,
    'Industrial Complex units'
  );

  // Pre-generate assets for Industrial Complex
  console.log('  📦 Generating assets for Industrial Complex...');
  const industrialAssets = [];
  const assetTypes = Object.keys(ASSET_TEMPLATES);

  // Only 70% of rooms have assets for realistic distribution
  const unitsWithAssets = industrialUnits.filter(() => Math.random() > 0.3);

  for (const unit of unitsWithAssets) {
    const numAssets = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < numAssets; i++) {
      const assetType = assetTypes[Math.floor(Math.random() * assetTypes.length)] as keyof typeof ASSET_TEMPLATES;
      const assetNameList = ASSET_TEMPLATES[assetType];
      const assetName = assetNameList[Math.floor(Math.random() * assetNameList.length)];

      industrialAssets.push({
        id: generateUUID(),
        name: `${assetName} - ${unit.name}`,
        description: `${assetName} located in ${unit.name}`,
        type: assetType,
        status: ['OPERATIONAL', 'NEEDS_MAINTENANCE', 'OUT_OF_SERVICE'][Math.floor(Math.random() * 3)] as any,
        purchaseDate: new Date(2015 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        warrantyExpiry: new Date(2024 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        lastMaintenance: Math.random() > 0.5 ? new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1) : null,
        siteId: industrialSite.id,
        unitId: unit.id,
      });
    }
  }

  await createInBatches(
    (data) => prisma.asset.createMany({ data }),
    industrialAssets,
    'Industrial Complex assets'
  );

  // Pre-generate work orders for Industrial Complex
  console.log('  📋 Generating work orders for Industrial Complex...');
  const industrialWorkOrders = [];
  const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'];
  const workOrderTitles = ['Preventive Maintenance', 'Emergency Repair', 'Annual Inspection', 'Routine Check-up'];

  for (let i = 0; i < 500; i++) {
    const asset = industrialAssets[Math.floor(Math.random() * industrialAssets.length)];
    const title = workOrderTitles[Math.floor(Math.random() * workOrderTitles.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
    const priority = priorities[Math.floor(Math.random() * priorities.length)] as any;
    const manager = managers[Math.floor(Math.random() * managers.length)];
    const technician = technicians[Math.floor(Math.random() * technicians.length)];

    const createdAt = new Date(2023 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const completedAt = status === 'COMPLETED' ? new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000) : null;
    const dueDate = new Date(createdAt.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000);

    industrialWorkOrders.push({
      id: generateUUID(),
      title: `${title} - ${asset.name}`,
      description: `Perform ${title.toLowerCase()} on ${asset.name}.`,
      priority,
      status,
      dueDate,
      completedAt,
      createdAt,
      assetId: asset.id,
      unitId: asset.unitId,
      siteId: industrialSite.id,
      createdById: manager.id,
      assignedToId: Math.random() > 0.2 ? technician.id : null,
      organizationId: randomCorpOrg.id,
    });
  }

  await createInBatches(
    (data) => prisma.workOrder.createMany({ data }),
    industrialWorkOrders,
    'Industrial Complex work orders'
  );

  // Create Commercial Plaza site (streamlined)
  console.log('\n  🏬 Creating Commercial Plaza...');
  const commercialSite = await withRetry(() => prisma.site.create({
    data: {
      name: 'Commercial Plaza',
      address: '789 Shopping Center Drive',
      city: 'Metropolis',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      phoneNumber: '(212) 555-0300',
      organizationId: randomCorpOrg.id,
    },
  }));

  // Generate simplified data for Commercial Plaza
  const commercialBuildings = [];
  const commercialUnits = [];
  const commercialAssets = [];
  const commercialWorkOrders = [];

  for (let i = 1; i <= 3; i++) {
    const buildingId = generateUUID();
    commercialBuildings.push({
      id: buildingId,
      name: `Tower ${i}`,
      description: `Office and retail tower ${i}`,
      address: `${789 + i} Shopping Center Drive`,
      city: 'Metropolis',
      state: 'NY',
      zipCode: '10001',
      yearBuilt: 2010 + i * 2,
      floors: 10 + i * 5,
      squareFeet: 100000 + (i * 25000),
      siteId: commercialSite.id,
    });

    // Generate units for this building
    const numFloors = 10 + i * 5;
    for (let floor = 1; floor <= numFloors; floor++) {
      const roomsPerFloor = floor <= 2 ? 6 : 3;
      for (let room = 1; room <= roomsPerFloor; room++) {
        const unitId = generateUUID();
        const roomTypes = ['Retail Store', 'Office', 'Restaurant', 'Conference Room'];
        const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];

        commercialUnits.push({
          id: unitId,
          roomNumber: `Tower${i}-${floor}${String(room).padStart(2, '0')}`,
          name: roomType,
          floor,
          squareFeet: roomType === 'Retail Store' || roomType === 'Restaurant' ? 1000 + Math.floor(Math.random() * 2000) : 200 + Math.floor(Math.random() * 300),
          description: `${roomType} in Tower ${i}`,
          siteId: commercialSite.id,
          buildingId,
        });

        // Add assets to some units
        if (Math.random() > 0.4) {
          const assetTypes = Object.keys(ASSET_TEMPLATES);
          const assetType = assetTypes[Math.floor(Math.random() * assetTypes.length)] as keyof typeof ASSET_TEMPLATES;
          const assetName = ASSET_TEMPLATES[assetType][Math.floor(Math.random() * ASSET_TEMPLATES[assetType].length)];

          const assetId = generateUUID();
          commercialAssets.push({
            id: assetId,
            name: `${assetName} - ${roomType}`,
            description: `${assetName} in Tower ${i}`,
            type: assetType,
            status: ['OPERATIONAL', 'NEEDS_MAINTENANCE', 'OUT_OF_SERVICE'][Math.floor(Math.random() * 3)] as any,
            purchaseDate: new Date(2018 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            warrantyExpiry: new Date(2025 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            lastMaintenance: Math.random() > 0.5 ? new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1) : null,
            siteId: commercialSite.id,
            unitId,
          });

          // Create work order for some assets
          if (Math.random() > 0.3) {
            const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
            const priority = priorities[Math.floor(Math.random() * priorities.length)] as any;
            const manager = managers[Math.floor(Math.random() * managers.length)];
            const technician = technicians[Math.floor(Math.random() * technicians.length)];

            const createdAt = new Date(2023 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
            const completedAt = status === 'COMPLETED' ? new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000) : null;
            const dueDate = new Date(createdAt.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000);

            commercialWorkOrders.push({
              id: generateUUID(),
              title: `Maintenance - ${assetName}`,
              description: `Perform maintenance on ${assetName}.`,
              priority,
              status,
              dueDate,
              completedAt,
              createdAt,
              assetId,
              unitId,
              siteId: commercialSite.id,
              createdById: manager.id,
              assignedToId: Math.random() > 0.2 ? technician.id : null,
              organizationId: randomCorpOrg.id,
            });
          }
        }
      }
    }
  }

  // Create all Commercial Plaza data in batches
  await createInBatches(
    (data) => prisma.building.createMany({ data }),
    commercialBuildings,
    'Commercial Plaza buildings'
  );

  await createInBatches(
    (data) => prisma.unit.createMany({ data }),
    commercialUnits,
    'Commercial Plaza units'
  );

  await createInBatches(
    (data) => prisma.asset.createMany({ data }),
    commercialAssets,
    'Commercial Plaza assets'
  );

  await createInBatches(
    (data) => prisma.workOrder.createMany({ data }),
    commercialWorkOrders,
    'Commercial Plaza work orders'
  );

  // Create minimal audit logs (only if configured)
  if (PRODUCTION_CONFIG.createAuditLogs) {
    console.log('\n  📝 Creating audit logs...');
    const auditLogs = [];
    const actions = ['LOGIN', 'LOGOUT', 'CREATE_WORK_ORDER', 'UPDATE_WORK_ORDER'];

    for (let i = 0; i < 50; i++) {
      auditLogs.push({
        id: generateUUID(),
        action: actions[Math.floor(Math.random() * actions.length)],
        details: { source: 'seed' },
        createdAt: new Date(),
        userId: technicians[Math.floor(Math.random() * technicians.length)].id,
      });
    }

    await createInBatches(
      (data) => prisma.auditLog.createMany({ data }),
      auditLogs,
      'Audit logs'
    );
  }

  // ========================================
  // SUMMARY
  // ========================================
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  console.log('\n🎉 PRODUCTION seeding completed successfully!\n');
  console.log(`⏱️  Total time: ${duration.toFixed(2)} seconds\n`);

  const totalOrgs = await prisma.organization.count();
  const totalUsers = await prisma.user.count();
  const totalSites = await prisma.site.count();
  const totalBuildings = await prisma.building.count();
  const totalUnits = await prisma.unit.count();
  const totalAssets = await prisma.asset.count();
  const totalWorkOrders = await prisma.workOrder.count();

  console.log('📊 Database Summary:');
  console.log(`  Organizations: ${totalOrgs}`);
  console.log(`  Users: ${totalUsers}`);
  console.log(`  Sites: ${totalSites}`);
  console.log(`  Buildings: ${totalBuildings}`);
  console.log(`  Units: ${totalUnits}`);
  console.log(`  Assets: ${totalAssets}`);
  console.log(`  Work Orders: ${totalWorkOrders}\n`);

  console.log('🔑 Login Credentials:');
  console.log('  Spore Test Org:');
  console.log('    Email: zack@sporecmms.com');
  console.log('    Password: admin123456');
  console.log('\n  Random Data Corp:');
  console.log('    Email: owner@randomdatacorp.com');
  console.log('    Password: password123');
  console.log('  All other users: password123\n');

  // Performance metrics
  console.log('📈 Performance Metrics:');
  console.log(`  - Records/sec: ${((totalOrgs + totalUsers + totalSites + totalBuildings + totalUnits + totalAssets + totalWorkOrders) / duration).toFixed(2)}`);
  console.log(`  - Average batch time: ${(duration / (totalOrgs + totalUsers + totalSites + totalBuildings + totalUnits + totalAssets + totalWorkOrders) * 1000).toFixed(2)}ms`);
}

main()
  .catch(async (e) => {
    console.error('❌ Fatal error:', e);
    if (e instanceof Error) {
      console.error('Stack trace:', e.stack);
    }
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });