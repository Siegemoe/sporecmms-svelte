import 'dotenv/config';
import { createNodePrismaClient } from '../src/lib/server/prisma.js';
import bcrypt from 'bcryptjs';

const prismaPromise = createNodePrismaClient();

// Test users for production
const testUsers = [
  {
    // User 1: Facility Manager
    orgName: "TechCorp Solutions",
    email: "manager@techcorp.dev",
    password: "TechCorp2025!",
    firstName: "Sarah",
    lastName: "Johnson",
    role: "MANAGER" as const,
    sites: [
      {
        name: "Data Center - North",
        rooms: [
          { name: "Server Room A", building: "Building A", floor: 1 },
          { name: "Network Closet", building: "Building A", floor: 2 },
          { name: "Backup Power Room", building: "Building B", floor: 1 }
        ],
        assets: [
          { name: "Dell PowerEdge R740", type: "Server" },
          { name: "Cisco Nexus 9000", type: "Switch" },
          { name: "APC Smart-UPS X", type: "UPS" },
          { name: "NetApp FAS2750", type: "NAS" }
        ]
      },
      {
        name: "Office Complex",
        rooms: [
          { name: "IT Office", building: "Main Building", floor: 3 },
          { name: "Conference Room", building: "Main Building", floor: 2 },
          { name: "Reception", building: "Main Building", floor: 1 }
        ],
        assets: [
          { name: "HP LaserJet Pro", type: "Printer" },
          { name: "Ricoh Copier", type: "Copier" },
          { name: "Conference AV System", type: "AV Equipment" }
        ]
      }
    ]
  },
  {
    // User 2: Maintenance Technician
    orgName: "FacilityCare Pro",
    email: "tech@facilitycare.pro",
    password: "Maintain#2025",
    firstName: "Mike",
    lastName: "Rodriguez",
    role: "TECHNICIAN" as const,
    sites: [
      {
        name: "Manufacturing Plant",
        rooms: [
          { name: "Production Floor A", building: "Plant", floor: 1 },
          { name: "Production Floor B", building: "Plant", floor: 1 },
          { name: "Quality Control Lab", building: "Plant", floor: 2 },
          { name: "Maintenance Workshop", building: "Plant", floor: 1 }
        ],
        assets: [
          { name: "CNC Milling Machine #1", type: "Equipment" },
          { name: "CNC Lathe #2", type: "Equipment" },
          { name: "Industrial Compressor", type: "Equipment" },
          { name: "Welding Station", type: "Equipment" },
          { name: "Forklift #1", type: "Vehicle" },
          { name: "Forklift #2", type: "Vehicle" }
        ]
      },
      {
        name: "Warehouse Facility",
        rooms: [
          { name: "Main Storage", building: "Warehouse", floor: 1 },
          { name: "Cold Storage", building: "Warehouse", floor: 1 },
          { name: "Shipping Area", building: "Warehouse", floor: 1 }
        ],
        assets: [
          { name: "Pallet Racking System", type: "Storage" },
          { name: "Forklift Charging Station", type: "Equipment" },
          { name: "Conveyor Belt", type: "Equipment" }
        ]
      }
    ]
  },
  {
    // User 3: IT Administrator
    orgName: "Digital Innovations Ltd",
    email: "admin@digitalinnovations.io",
    password: "Digital@2025!",
    firstName: "Alex",
    lastName: "Chen",
    role: "ADMIN" as const,
    sites: [
      {
        name: "Corporate Headquarters",
        rooms: [
          { name: "Server Room", building: "HQ Tower", floor: 15 },
          { name: "Network Operations Center", building: "HQ Tower", floor: 14 },
          { name: "Executive Server Room", building: "HQ Tower", floor: 16 }
        ],
        assets: [
          { name: "VMware ESXi Cluster", type: "Server" },
          { name: "Cisco UCS Server", type: "Server" },
          { name: "NetApp AFF A800", type: "NAS" },
          { name: "Dell EMC PowerMax", type: "Storage" },
          { name: "Fortigate 600E", type: "Firewall" },
          { name: "Palo Alto PA-5220", type: "Firewall" }
        ]
      },
      {
        name: "Development Center",
        rooms: [
          { name: "DevOps Lab", building: "Innovation Hub", floor: 3 },
          { name: "Testing Environment", building: "Innovation Hub", floor: 2 },
          { name: "QA Lab", building: "Innovation Hub", floor: 2 }
        ],
        assets: [
          { name: "Jenkins CI/CD Server", type: "Server" },
          { name: "GitLab Runner", type: "Server" },
          { name: "Test Database Server", type: "Server" },
          { name: "Performance Testing Rig", type: "Equipment" }
        ]
      }
    ]
  }
];

async function main() {
  console.log('🚀 Starting production user seeding...\n');

  const prisma = await prismaPromise;

  try {
    for (const userData of testUsers) {
      console.log(`\n📁 Creating organization: ${userData.orgName}`);

      // Check if organization already exists
      let org = await prisma.org.findFirst({
        where: { name: userData.orgName },
      });

      if (!org) {
        org = await prisma.org.create({
          data: {
            name: userData.orgName,
          },
        });
        console.log(`  ✅ Created: ${org.name} (ID: ${org.id})`);
      } else {
        console.log(`  ℹ️  Already exists: ${org.name} (ID: ${org.id})`);
      }

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: { email: userData.email },
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const user = await prisma.user.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            orgId: org.id,
          },
        });
        console.log(`  👤 Created user: ${user.email}`);

        // Create sites, rooms, and assets
        for (const siteData of userData.sites) {
          const site = await prisma.site.create({
            data: {
              name: siteData.name,
              orgId: org.id,
            },
          });
          console.log(`    🏢 Created site: ${site.name}`);

          // Create rooms
          for (const roomData of siteData.rooms) {
            const room = await prisma.room.create({
              data: {
                name: roomData.name,
                building: roomData.building,
                floor: roomData.floor,
                siteId: site.id,
              },
            });
            console.log(`      🚪 Created room: ${room.name} (${room.building}, Floor ${room.floor})`);

            // Create assets
            for (const assetData of siteData.assets) {
              const asset = await prisma.asset.create({
                data: {
                  name: assetData.name,
                  type: assetData.type,
                  roomId: room.id,
                },
              });
              console.log(`        📦 Created asset: ${asset.name} (${assetData.type})`);

              // Create some sample work orders
              await prisma.workOrder.create({
                data: {
                  title: `Initial inspection for ${assetData.name}`,
                  description: `Perform initial setup and baseline inspection for new ${assetData.type.toLowerCase()}`,
                  failureMode: assetData.type === 'Server' || assetData.type === 'Equipment' ? 'Installation' : 'Preventive',
                  status: 'PENDING',
                  assetId: asset.id,
                  orgId: org.id,
                  assignedToId: user.id,
                },
              });
            }
          }
        }

        console.log(`\n  📋 Login credentials for ${userData.firstName} ${userData.lastName}:`);
        console.log(`     Email: ${userData.email}`);
        console.log(`     Password: ${userData.password}`);
        console.log(`     Role: ${userData.role}\n`);
      } else {
        console.log(`  ℹ️  User already exists: ${existingUser.email}`);
      }
    }

    console.log('\n🎉 Production seeding completed successfully!\n');

    // Summary
    const totalOrgs = await prisma.org.count();
    const totalUsers = await prisma.user.count();
    const totalSites = await prisma.site.count();
    const totalRooms = await prisma.room.count();
    const totalAssets = await prisma.asset.count();

    console.log('📊 Database Summary:');
    console.log(`  Organizations: ${totalOrgs}`);
    console.log(`  Users: ${totalUsers}`);
    console.log(`  Sites: ${totalSites}`);
    console.log(`  Rooms: ${totalRooms}`);
    console.log(`  Assets: ${totalAssets}`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch(async (e) => {
    console.error('❌ Fatal error:', e);
    const prisma = await prismaPromise;
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    const prisma = await prismaPromise;
    await prisma.$disconnect();
  });