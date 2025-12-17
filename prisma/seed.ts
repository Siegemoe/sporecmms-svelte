import 'dotenv/config';
import { createNodePrismaClient } from '../src/lib/server/prisma.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = await createNodePrismaClient();

// Helper function to generate random dates
function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to generate UUID
function generateUUID(): string {
  return uuidv4();
}

// Helper function to generate random skills for technicians
function generateRandomSkills(): string[] {
  const allSkills = [
    'HVAC', 'Electrical', 'Plumbing', 'Carpentry', 'Painting',
    'Fire Safety', 'Elevator Maintenance', 'Security Systems',
    'Appliance Repair', 'General Maintenance', 'Welding', 'Masonry',
    'Roofing', 'Landscaping', 'Pool Maintenance', 'Pest Control',
    'Computer Hardware', 'Networking', 'Audio/Visual', 'Locksmithing'
  ];

  const numSkills = Math.floor(Math.random() * 4) + 2; // 2-5 skills
  const shuffled = [...allSkills].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numSkills);
}

// Helper function to generate random names
const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

function getRandomName() {
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

// Asset name generators by type
const assetNames = {
  HVAC: ['Central AC Unit', 'Rooftop HVAC Unit', 'Air Handler', 'Heat Pump', 'Furnace', 'Ventilation Fan', 'Chiller Unit', 'Boiler System', 'Thermostat', 'Condenser Unit'],
  ELECTRICAL: ['Main Circuit Breaker', 'Electrical Panel', 'Generator', 'Transformer', 'UPS System', 'Power Strip', 'Lighting Fixture', 'Emergency Light', 'Solar Panel', 'Inverter'],
  PLUMBING: ['Water Heater', 'Sump Pump', 'Toilet', 'Sink', 'Faucet', 'Water Filter', 'Sewage Pump', 'Backflow Preventer', 'Pressure Tank', 'Garbage Disposal'],
  FIRE_SAFETY: ['Fire Extinguisher', 'Smoke Detector', 'Sprinkler System', 'Fire Alarm', 'Emergency Exit Sign', 'Fire Hose', 'Fire Blanket', 'Smoke Vent', 'Fire Damper', 'Emergency Lighting'],
  ELEVATOR: ['Passenger Elevator', 'Freight Elevator', 'Dumbwaiter', 'Escalator', 'Lift Control Panel', 'Elevator Motor', 'Hydraulic Pump', 'Elevator Cable', 'Call Button', 'Floor Indicator'],
  SECURITY_SYSTEM: ['CCTV Camera', 'Access Control Panel', 'Motion Sensor', 'Door Lock', 'Security Alarm', 'Intercom System', 'Video Doorbell', 'Barcode Scanner', 'Metal Detector', 'Panic Button'],
  OTHER: ['Office Desk', 'Conference Table', 'Filing Cabinet', 'Printer', 'Coffee Machine', 'Water Cooler', 'Vending Machine', 'Projector', 'Whiteboard', 'Computer Monitor']
};

// Work order title generators
const workOrderTitles = [
  'Preventive Maintenance', 'Emergency Repair', 'Annual Inspection', 'Routine Check-up', 'System Upgrade',
  'Performance Test', 'Safety Inspection', 'Calibration', 'Cleaning Service', 'Filter Replacement',
  'Bulb Replacement', 'Battery Check', 'Lubrication Service', 'Tightening Fasteners', 'Leak Detection',
  'Noise Investigation', 'Vibration Analysis', 'Temperature Check', 'Pressure Test', 'Electrical Test'
];

async function main() {
  console.log('🚀 Starting comprehensive database seeding...\n');

  // Clean up existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning up existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.workOrderEvent.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.building.deleteMany();
  await prisma.site.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  console.log('✅ Database cleaned\n');

  // ========================================
  // ORGANIZATION 1: Spore Test Org
  // ========================================
  console.log('📁 Creating Organization 1: Spore Test Org');

  const sporeOrg = await prisma.organization.create({
    data: {
      name: 'Spore Test Org',
    },
  });
  console.log(`  ✅ Created: ${sporeOrg.name} (ID: ${sporeOrg.id})`);

  // Create owner for Spore Test Org
  const hashedPassword = await bcrypt.hash('admin123456', 10);
  const sporeOwner = await prisma.user.create({
    data: {
      email: 'zack@sporecmms.com',
      password: hashedPassword,
      firstName: 'Zack',
      lastName: 'Spore',
      role: 'ADMIN',
      organizationId: sporeOrg.id,
      isActive: true,
    },
  });
  console.log(`  👤 Created owner: ${sporeOwner.email}\n`);

  // Create Misty Cove site
  console.log('  🏢 Creating site: Misty Cove');
  const mistyCoveSite = await prisma.site.create({
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
  });
  console.log(`    ✅ Created: ${mistyCoveSite.name}\n`);

  // Create Building for Misty Cove
  console.log('  🏠 Creating buildings...');
  const mainBuilding = await prisma.building.create({
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
  });
  console.log(`    ✅ Created: ${mainBuilding.name}\n`);

  // Create rooms/units for Misty Cove
  console.log('  🚪 Creating rooms (38 total)...');
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
  mistyCoveUnits.push(
    {
      id: generateUUID(),
      roomNumber: 'OFFICE-001',
      name: 'Front Office',
      floor: 1,
      squareFeet: 500,
      description: 'Main reception and administrative office',
      siteId: mistyCoveSite.id,
      buildingId: mainBuilding.id,
    },
    {
      id: generateUUID(),
      roomNumber: 'LOBBY-001',
      name: 'Main Lobby',
      floor: 1,
      squareFeet: 2000,
      description: 'Spacious lobby with seating area and reception desk',
      siteId: mistyCoveSite.id,
      buildingId: mainBuilding.id,
    },
    {
      id: generateUUID(),
      roomNumber: 'LIB-001',
      name: 'Library',
      floor: 2,
      squareFeet: 300,
      description: 'Quiet reading room with book collection',
      siteId: mistyCoveSite.id,
      buildingId: mainBuilding.id,
    },
    {
      id: generateUUID(),
      roomNumber: 'STOR-001',
      name: 'Storage Room A',
      floor: 1,
      squareFeet: 200,
      description: 'General storage for hotel supplies',
      siteId: mistyCoveSite.id,
      buildingId: mainBuilding.id,
    },
    {
      id: generateUUID(),
      roomNumber: 'STOR-002',
      name: 'Storage Room B',
      floor: 4,
      squareFeet: 150,
      description: 'Storage for cleaning equipment',
      siteId: mistyCoveSite.id,
      buildingId: mainBuilding.id,
    },
    {
      id: generateUUID(),
      roomNumber: 'MECH-001',
      name: 'Mechanical Room',
      floor: -1,
      squareFeet: 400,
      description: 'HVAC and mechanical equipment room',
      siteId: mistyCoveSite.id,
      buildingId: mainBuilding.id,
    },
    {
      id: generateUUID(),
      roomNumber: 'REST-001',
      name: 'Public Restroom',
      floor: 1,
      squareFeet: 100,
      description: 'Public restroom near lobby',
      siteId: mistyCoveSite.id,
      buildingId: mainBuilding.id,
    }
  );

  await prisma.unit.createMany({ data: mistyCoveUnits });
  console.log(`    ✅ Created ${mistyCoveUnits.length} units\n`);

  // ========================================
  // ORGANIZATION 2: Random Data Corp
  // ========================================
  console.log('\n📁 Creating Organization 2: Random Data Corp');

  const randomCorpOrg = await prisma.organization.create({
    data: {
      name: 'Random Data Corp',
    },
  });
  console.log(`  ✅ Created: ${randomCorpOrg.name} (ID: ${randomCorpOrg.id})`);

  // Create users for Random Data Corp
  console.log('  👥 Creating users...');

  // Create Owner
  const hashedPassword2 = await bcrypt.hash('password123', 10);
  const randomCorpOwner = await prisma.user.create({
    data: {
      email: 'owner@randomdatacorp.com',
      password: hashedPassword2,
      firstName: 'Robert',
      lastName: 'Anderson',
      role: 'ADMIN',
      organizationId: randomCorpOrg.id,
      isActive: true,
    },
  });
  console.log(`    ✅ Created owner: ${randomCorpOwner.email}`);

  // Create Managers
  const managers = [];
  for (let i = 1; i <= 5; i++) {
    const name = getRandomName();
    const [firstName, lastName] = name.split(' ');
    managers.push(await prisma.user.create({
      data: {
        email: `manager${i}@randomdatacorp.com`,
        password: hashedPassword2,
        firstName,
        lastName,
        role: 'MANAGER',
        organizationId: randomCorpOrg.id,
        isActive: true,
      },
    }));
    console.log(`    ✅ Created manager: manager${i}@randomdatacorp.com`);
  }

  // Create Technicians
  const technicians = [];
  for (let i = 1; i <= 40; i++) {
    const name = getRandomName();
    const [firstName, lastName] = name.split(' ');
    technicians.push(await prisma.user.create({
      data: {
        email: `tech${i}@randomdatacorp.com`,
        password: hashedPassword2,
        firstName,
        lastName,
        role: 'TECHNICIAN',
        organizationId: randomCorpOrg.id,
        isActive: true,
      },
    }));
    console.log(`    ✅ Created technician: tech${i}@randomdatacorp.com`);
  }

  // Create Read-only users
  for (let i = 1; i <= 5; i++) {
    const name = getRandomName();
    const [firstName, lastName] = name.split(' ');
    await prisma.user.create({
      data: {
        email: `readonly${i}@randomdatacorp.com`,
        password: hashedPassword2,
        firstName,
        lastName,
        role: 'TECHNICIAN', // Using TECHNICIAN role as read-only isn't in schema
        organizationId: randomCorpOrg.id,
        isActive: true,
      },
    });
    console.log(`    ✅ Created read-only user: readonly${i}@randomdatacorp.com`);
  }

  // Create Industrial Complex site
  console.log('\n  🏭 Creating site: Industrial Complex');
  const industrialSite = await prisma.site.create({
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
  });
  console.log(`    ✅ Created: ${industrialSite.name}`);

  // Create buildings for Industrial Complex
  console.log('  🏠 Creating buildings for Industrial Complex...');
  const industrialBuildings = [];
  for (let i = 1; i <= 5; i++) {
    industrialBuildings.push(await prisma.building.create({
      data: {
        name: `Building ${String.fromCharCode(64 + i)}`, // A, B, C, D, E
        description: `Manufacturing and warehouse building ${i}`,
        address: `${456 + i} Manufacturing Boulevard`,
        city: 'Industrial City',
        state: 'TX',
        zipCode: '75201',
        yearBuilt: 2000 + i * 2,
        floors: i === 1 ? 3 : 1,
        squareFeet: 50000 + (i * 10000),
        siteId: industrialSite.id,
      },
    }));
    console.log(`    ✅ Created: ${industrialBuildings[i - 1].name}`);
  }

  // Create units for Industrial Complex (100+ rooms)
  console.log('  🚪 Creating units for Industrial Complex (100+ rooms)...');
  const industrialUnits = [];
  let roomCounter = 1;

  for (const building of industrialBuildings) {
    const numFloors = building.floors || 1;
    for (let floor = 1; floor <= numFloors; floor++) {
      const roomsPerFloor = floor === 1 ? 25 : 15;
      for (let i = 1; i <= roomsPerFloor; i++) {
        const roomTypes = ['Production Area', 'Storage', 'Office', 'Break Room', 'Quality Control', 'Loading Dock', 'Workshop', 'Lab', 'Conference Room'];
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
        roomCounter++;
      }
    }
  }

  await prisma.unit.createMany({ data: industrialUnits });
  console.log(`    ✅ Created ${industrialUnits.length} units\n`);

  // Create assets for Industrial Complex
  console.log('  📦 Creating assets for Industrial Complex (300+ assets)...');
  const assetTypes = Object.keys(assetNames);
  const industrialAssets = [];
  const industrialUnitsWithAssets = industrialUnits.filter(() => Math.random() > 0.3); // 70% of rooms have assets

  for (const unit of industrialUnitsWithAssets) {
    const numAssets = Math.floor(Math.random() * 5) + 1; // 1-5 assets per unit
    for (let i = 0; i < numAssets; i++) {
      const assetType = assetTypes[Math.floor(Math.random() * assetTypes.length)] as keyof typeof assetNames;
      const assetNameList = assetNames[assetType];
      const assetName = assetNameList[Math.floor(Math.random() * assetNameList.length)];

      industrialAssets.push({
        id: generateUUID(),
        name: `${assetName} - ${unit.name}`,
        description: `${assetName} located in ${unit.name}`,
        type: assetType,
        status: ['OPERATIONAL', 'NEEDS_MAINTENANCE', 'OUT_OF_SERVICE'][Math.floor(Math.random() * 3)] as any,
        purchaseDate: randomDate(new Date(2015, 0, 1), new Date(2023, 0, 1)),
        warrantyExpiry: randomDate(new Date(2024, 0, 1), new Date(2028, 0, 1)),
        lastMaintenance: Math.random() > 0.5 ? randomDate(new Date(2023, 0, 1), new Date()) : null,
        siteId: industrialSite.id,
        unitId: unit.id,
      });
    }
  }

  await prisma.asset.createMany({ data: industrialAssets });
  console.log(`    ✅ Created ${industrialAssets.length} assets\n`);

  // Create work orders for Industrial Complex
  console.log('  📋 Creating work orders for Industrial Complex (500+ work orders)...');
  const industrialWorkOrders = [];
  const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'];

  for (let i = 0; i < 500; i++) {
    const asset = industrialAssets[Math.floor(Math.random() * industrialAssets.length)];
    const title = workOrderTitles[Math.floor(Math.random() * workOrderTitles.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
    const priority = priorities[Math.floor(Math.random() * priorities.length)] as any;
    const technician = technicians[Math.floor(Math.random() * technicians.length)];

    const createdAt = randomDate(new Date(2023, 0, 1), new Date());
    const completedAt = status === 'COMPLETED' ? randomDate(createdAt, new Date()) : null;
    const dueDate = randomDate(createdAt, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // Up to 30 days from now

    industrialWorkOrders.push({
      id: generateUUID(),
      title: `${title} - ${asset.name}`,
      description: `Perform ${title.toLowerCase()} on ${asset.name}. Ensure all safety protocols are followed.`,
      priority,
      status,
      dueDate,
      completedAt,
      createdAt,
      assetId: asset.id,
      unitId: asset.unitId,
      buildingId: industrialUnits.find(u => u.id === asset.unitId)?.buildingId || null,
      siteId: industrialSite.id,
      createdById: managers[Math.floor(Math.random() * managers.length)].id,
      assignedToId: Math.random() > 0.2 ? technician.id : null, // 80% assigned
      organizationId: randomCorpOrg.id,
    });
  }

  // Batch create work orders to avoid hitting limits
  const batchSize = 100;
  for (let i = 0; i < industrialWorkOrders.length; i += batchSize) {
    const batch = industrialWorkOrders.slice(i, i + batchSize);
    await prisma.workOrder.createMany({ data: batch });
    console.log(`    ✅ Created batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(industrialWorkOrders.length / batchSize)}`);
  }

  // Create work order events for history
  console.log('  📝 Creating work order events...');
  const createdWorkOrders = await prisma.workOrder.findMany({
    where: { organizationId: randomCorpOrg.id },
    select: { id: true, status: true, createdAt: true, assignedToId: true }
  });

  const workOrderEvents = [];
  for (const workOrder of createdWorkOrders) {
    // Create initial event
    workOrderEvents.push({
      id: generateUUID(),
      event: 'CREATED',
      description: 'Work order created',
      createdAt: workOrder.createdAt,
      workOrderId: workOrder.id,
      userId: technicians[Math.floor(Math.random() * technicians.length)].id,
    });

    // Add status change events
    if (workOrder.status === 'IN_PROGRESS') {
      workOrderEvents.push({
        id: generateUUID(),
        event: 'ASSIGNED',
        description: `Assigned to technician`,
        createdAt: new Date(workOrder.createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Within 7 days
        workOrderId: workOrder.id,
        userId: workOrder.assignedToId,
      });
    } else if (workOrder.status === 'COMPLETED') {
      workOrderEvents.push({
        id: generateUUID(),
        event: 'ASSIGNED',
        description: `Assigned to technician`,
        createdAt: new Date(workOrder.createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        workOrderId: workOrder.id,
        userId: workOrder.assignedToId,
      });
      workOrderEvents.push({
        id: generateUUID(),
        event: 'IN_PROGRESS',
        description: 'Work started',
        createdAt: new Date(workOrder.createdAt.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000),
        workOrderId: workOrder.id,
        userId: workOrder.assignedToId,
      });
      workOrderEvents.push({
        id: generateUUID(),
        event: 'COMPLETED',
        description: 'Work completed successfully',
        createdAt: new Date(workOrder.createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        workOrderId: workOrder.id,
        userId: workOrder.assignedToId,
      });
    }
  }

  await prisma.workOrderEvent.createMany({ data: workOrderEvents });
  console.log(`    ✅ Created ${workOrderEvents.length} work order events\n`);

  // Create Commercial Plaza site
  console.log('  🏬 Creating site: Commercial Plaza');
  const commercialSite = await prisma.site.create({
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
  });
  console.log(`    ✅ Created: ${commercialSite.name}`);

  // Create buildings for Commercial Plaza
  console.log('  🏠 Creating buildings for Commercial Plaza...');
  const commercialBuildings = [];
  for (let i = 1; i <= 3; i++) {
    commercialBuildings.push(await prisma.building.create({
      data: {
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
      },
    }));
    console.log(`    ✅ Created: ${commercialBuildings[i - 1].name}`);
  }

  // Create units for Commercial Plaza (50+ rooms)
  console.log('  🚪 Creating units for Commercial Plaza (50+ rooms)...');
  const commercialUnits = [];

  for (const building of commercialBuildings) {
    const numFloors = building.floors || 10;
    for (let floor = 1; floor <= numFloors; floor++) {
      const roomsPerFloor = floor <= 2 ? 8 : 4; // More rooms on lower floors
      for (let i = 1; i <= roomsPerFloor; i++) {
        const roomTypes = ['Retail Store', 'Office', 'Restaurant', 'Conference Room', 'Storage', 'Break Room', 'Lobby', 'Restroom'];
        const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];

        commercialUnits.push({
          id: generateUUID(),
          roomNumber: `${building.name}-${floor}${String(i).padStart(2, '0')}`,
          name: roomType,
          floor,
          squareFeet: roomType === 'Retail Store' || roomType === 'Restaurant' ? 1000 + Math.floor(Math.random() * 2000) : 200 + Math.floor(Math.random() * 300),
          description: `${roomType} in ${building.name}`,
          siteId: commercialSite.id,
          buildingId: building.id,
        });
      }
    }
  }

  await prisma.unit.createMany({ data: commercialUnits });
  console.log(`    ✅ Created ${commercialUnits.length} units\n`);

  // Create assets for Commercial Plaza
  console.log('  📦 Creating assets for Commercial Plaza (200+ assets)...');
  const commercialAssets = [];
  const commercialUnitsWithAssets = commercialUnits.filter(() => Math.random() > 0.4); // 60% of rooms have assets

  for (const unit of commercialUnitsWithAssets) {
    const numAssets = Math.floor(Math.random() * 4) + 1; // 1-4 assets per unit
    for (let i = 0; i < numAssets; i++) {
      const assetType = assetTypes[Math.floor(Math.random() * assetTypes.length)] as keyof typeof assetNames;
      const assetNameList = assetNames[assetType];
      const assetName = assetNameList[Math.floor(Math.random() * assetNameList.length)];

      commercialAssets.push({
        id: generateUUID(),
        name: `${assetName} - ${unit.name}`,
        description: `${assetName} located in ${unit.name}`,
        type: assetType,
        status: ['OPERATIONAL', 'NEEDS_MAINTENANCE', 'OUT_OF_SERVICE'][Math.floor(Math.random() * 3)] as any,
        purchaseDate: randomDate(new Date(2018, 0, 1), new Date(2024, 0, 1)),
        warrantyExpiry: randomDate(new Date(2025, 0, 1), new Date(2029, 0, 1)),
        lastMaintenance: Math.random() > 0.5 ? randomDate(new Date(2023, 0, 1), new Date()) : null,
        siteId: commercialSite.id,
        unitId: unit.id,
      });
    }
  }

  await prisma.asset.createMany({ data: commercialAssets });
  console.log(`    ✅ Created ${commercialAssets.length} assets\n`);

  // Create work orders for Commercial Plaza
  console.log('  📋 Creating work orders for Commercial Plaza (300+ work orders)...');
  const commercialWorkOrders = [];

  for (let i = 0; i < 300; i++) {
    const asset = commercialAssets[Math.floor(Math.random() * commercialAssets.length)];
    const title = workOrderTitles[Math.floor(Math.random() * workOrderTitles.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
    const priority = priorities[Math.floor(Math.random() * priorities.length)] as any;
    const technician = technicians[Math.floor(Math.random() * technicians.length)];

    const createdAt = randomDate(new Date(2023, 0, 1), new Date());
    const completedAt = status === 'COMPLETED' ? randomDate(createdAt, new Date()) : null;
    const dueDate = randomDate(createdAt, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

    commercialWorkOrders.push({
      id: generateUUID(),
      title: `${title} - ${asset.name}`,
      description: `Perform ${title.toLowerCase()} on ${asset.name}. Ensure minimal disruption to business operations.`,
      priority,
      status,
      dueDate,
      completedAt,
      createdAt,
      assetId: asset.id,
      unitId: asset.unitId,
      buildingId: commercialUnits.find(u => u.id === asset.unitId)?.buildingId || null,
      siteId: commercialSite.id,
      createdById: managers[Math.floor(Math.random() * managers.length)].id,
      assignedToId: Math.random() > 0.2 ? technician.id : null, // 80% assigned
      organizationId: randomCorpOrg.id,
    });
  }

  // Batch create work orders
  for (let i = 0; i < commercialWorkOrders.length; i += batchSize) {
    const batch = commercialWorkOrders.slice(i, i + batchSize);
    await prisma.workOrder.createMany({ data: batch });
    console.log(`    ✅ Created batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(commercialWorkOrders.length / batchSize)}`);
  }

  // Create audit logs for user activities
  console.log('\n  📝 Creating audit logs...');
  const auditLogs = [];
  const allUsers = [sporeOwner, randomCorpOwner, ...managers, ...technicians];
  const actions = ['LOGIN', 'LOGOUT', 'CREATE_WORK_ORDER', 'UPDATE_WORK_ORDER', 'DELETE_WORK_ORDER', 'CREATE_ASSET', 'UPDATE_ASSET', 'VIEW_REPORT'];

  for (let i = 0; i < 100; i++) {
    const user = allUsers[Math.floor(Math.random() * allUsers.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];

    auditLogs.push({
      id: generateUUID(),
      action,
      details: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        timestamp: new Date().toISOString(),
      },
      createdAt: randomDate(new Date(2023, 0, 1), new Date()),
      userId: user.id,
    });
  }

  await prisma.auditLog.createMany({ data: auditLogs });
  console.log(`    ✅ Created ${auditLogs.length} audit logs\n`);

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n🎉 Database seeding completed successfully!\n');

  const totalOrgs = await prisma.organization.count();
  const totalUsers = await prisma.user.count();
  const totalSites = await prisma.site.count();
  const totalBuildings = await prisma.building.count();
  const totalUnits = await prisma.unit.count();
  const totalAssets = await prisma.asset.count();
  const totalWorkOrders = await prisma.workOrder.count();
  const totalWorkOrderEvents = await prisma.workOrderEvent.count();
  const totalAuditLogs = await prisma.auditLog.count();

  console.log('📊 Database Summary:');
  console.log(`  Organizations: ${totalOrgs}`);
  console.log(`  Users: ${totalUsers}`);
  console.log(`  Sites: ${totalSites}`);
  console.log(`  Buildings: ${totalBuildings}`);
  console.log(`  Units: ${totalUnits}`);
  console.log(`  Assets: ${totalAssets}`);
  console.log(`  Work Orders: ${totalWorkOrders}`);
  console.log(`  Work Order Events: ${totalWorkOrderEvents}`);
  console.log(`  Audit Logs: ${totalAuditLogs}\n`);

  console.log('🔑 Login Credentials:');
  console.log('  Spore Test Org:');
  console.log('    Email: zack@sporecmms.com');
  console.log('    Password: admin123456');
  console.log('\n  Random Data Corp:');
  console.log('    Email: owner@randomdatacorp.com');
  console.log('    Password: password123');
  console.log('  Managers: manager1-5@randomdatacorp.com');
  console.log('  Technicians: tech1-40@randomdatacorp.com');
  console.log('  Read-only: readonly1-5@randomdatacorp.com');
  console.log('  (All Random Data Corp users use: password123)\n');
}

main()
  .catch(async (e) => {
    console.error('❌ Fatal error:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });