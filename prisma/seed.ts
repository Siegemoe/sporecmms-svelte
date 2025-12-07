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

  // Create a demo room
  const room = await prisma.room.create({
    data: {
      name: 'Server Room',
      building: 'Main',
      floor: 1,
      siteId: site.id,
    },
  });
  console.log(`✅ Demo room created: ${room.name}`);

  // Create a demo asset
  const asset = await prisma.asset.create({
    data: {
      name: 'Main Server Rack',
      roomId: room.id,
    },
  });
  console.log(`✅ Demo asset created: ${asset.name}`);

  // Create a demo work order
  const workOrder = await prisma.workOrder.create({
    data: {
      title: 'Monthly Maintenance Check',
      description: 'Perform routine maintenance on server rack including cleaning and temperature checks',
      failureMode: 'Preventive Maintenance',
      status: 'PENDING',
      assetId: asset.id,
      orgId: org.id,
      assignedToId: adminUser.id,
    },
  });
  console.log(`✅ Demo work order created: ${workOrder.title}`);

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