import 'dotenv/config';
import { createNodePrismaClient } from '../src/lib/server/prisma.js';
import bcrypt from 'bcryptjs';

const prismaPromise = createNodePrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create a default organization
  const prisma = await prismaPromise;
  let org = await prisma.org.findFirst({
    where: { name: 'Spore CMMS Demo' },
  });

  if (!org) {
    org = await prisma.org.create({
      data: {
        name: 'Spore CMMS Demo',
      },
    });
    console.log(`✅ Organization created: ${org.name}`);
  } else {
    console.log(`✅ Organization already exists: ${org.name}`);
  }

  // Create an admin user
  const adminEmail = 'zack@sporecmms.com';
  const adminPassword = 'admin123456'; // Change this in production!

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      orgId: org.id,
    },
  });
  console.log(`✅ Admin user created: ${adminUser.email}`);

  // Create a demo site
  const site = await prisma.site.create({
    data: {
      name: 'Main Office',
      orgId: org.id,
    },
  });
  console.log(`✅ Demo site created: ${site.name}`);

  // Create a demo building
  const building = await prisma.building.create({
    data: {
      name: 'Main Building',
      siteId: site.id,
    },
  });
  console.log(`✅ Demo building created: ${building.name}`);

  // Create demo rooms
  const serverRoom = await prisma.room.create({
    data: {
      name: 'Server Room',
      floor: 1,
      siteId: site.id,
      buildingId: building.id,
    },
  });
  console.log(`✅ Demo room created: ${serverRoom.name}`);

  const breakRoom = await prisma.room.create({
    data: {
      name: 'Break Room',
      floor: 1,
      siteId: site.id,
      buildingId: building.id,
    },
  });
  console.log(`✅ Demo room created: ${breakRoom.name}`);

  // Create demo assets
  const asset1 = await prisma.asset.create({
    data: {
      name: 'Main Server Rack',
      roomId: serverRoom.id,
    },
  });
  console.log(`✅ Demo asset created: ${asset1.name}`);

  const asset2 = await prisma.asset.create({
    data: {
      name: 'Coffee Machine',
      roomId: breakRoom.id,
    },
  });
  console.log(`✅ Demo asset created: ${asset2.name}`);

  // Create demo work orders for each type
  const woAsset = await prisma.workOrder.create({
    data: {
      title: 'Server Maintenance',
      description: 'Perform routine maintenance on server rack',
      failureMode: 'Preventive Maintenance',
      status: 'PENDING',
      assetId: asset1.id,
      orgId: org.id,
      assignedToId: adminUser.id,
    },
  });
  console.log(`✅ Demo work order (Asset) created: ${woAsset.title}`);

  const woRoom = await prisma.workOrder.create({
    data: {
      title: 'Clean Break Room',
      description: 'Deep clean the break room floor and countertops',
      failureMode: 'General',
      status: 'PENDING',
      roomId: breakRoom.id,
      orgId: org.id,
      assignedToId: adminUser.id,
    },
  });
  console.log(`✅ Demo work order (Room) created: ${woRoom.title}`);

  const woBuilding = await prisma.workOrder.create({
    data: {
      title: 'Check HVAC System',
      description: 'Inspect and service building HVAC system',
      failureMode: 'HVAC',
      status: 'PENDING',
      buildingId: building.id,
      orgId: org.id,
      assignedToId: adminUser.id,
    },
  });
  console.log(`✅ Demo work order (Building) created: ${woBuilding.title}`);

  console.log('\n🎉 Database seeding completed!');
  console.log('\nLogin credentials:');
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log('\n⚠️  Remember to change the admin password in production!');
}

main()
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    const prisma = await prismaPromise;
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    const prisma = await prismaPromise;
    await prisma.$disconnect();
  });