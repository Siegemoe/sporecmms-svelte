import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/server/auth';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Seeding demo data...');

	// Create demo organization
	const demoOrg = await prisma.organization.upsert({
		where: { name: 'Sunrise Senior Living' },
		update: {},
		create: {
			name: 'Sunrise Senior Living'
		}
	});

	// Create demo admin user
	const hashedPassword = await hashPassword('Demo123!@#');

	const demoAdmin = await prisma.user.upsert({
		where: { email: 'admin@demo.com' },
		update: {},
		create: {
			email: 'admin@demo.com',
			password: hashedPassword,
			firstName: 'Sarah',
			lastName: 'Johnson',
			role: 'ADMIN',
			orgId: demoOrg.id
		}
	});

	// Create demo technician user
	const demoTech = await prisma.user.upsert({
		where: { email: 'tech@demo.com' },
		update: {},
		create: {
			email: 'tech@demo.com',
			password: hashedPassword,
			firstName: 'Mike',
			lastName: 'Wilson',
			role: 'TECHNICIAN',
			orgId: demoOrg.id
		}
	});

	// Create demo site
	const demoSite = await prisma.site.findFirst({
		where: {
			organizationId: demoOrg.id,
			name: 'Sunrise Residence A'
		}
	});

	const site = demoSite || await prisma.site.create({
		data: {
			name: 'Sunrise Residence A',
			address: '123 Main St',
			city: 'Anytown',
			state: 'CA',
			zipCode: '12345',
			organizationId: demoOrg.id
		}
	});

	// Create demo building
	const demoBuilding = await prisma.building.create({
		data: {
			name: 'Building 1',
			floors: 3,
			siteId: site.id
		}
	});

	// Create demo units
	for (let floor = 1; floor <= 3; floor++) {
		for (let room = 101; room <= 110; room++) {
			const roomNumber = `${floor}${room.toString().padStart(2, '0')}`;
			await prisma.unit.create({
				data: {
					roomNumber,
					floor,
					buildingId: demoBuilding.id,
					siteId: site.id
				}
			});
		}
	}

	// Create demo assets
	const unit101 = await prisma.unit.findFirst({
		where: { roomNumber: '101' }
	});

	if (unit101) {
		await prisma.asset.createMany({
			data: [
				{
					name: 'HVAC Unit',
					type: 'HVAC',
					unitId: unit101.id,
					siteId: site.id
				},
				{
					name: 'Emergency Light',
					type: 'FIRE_SAFETY',
					unitId: unit101.id,
					siteId: site.id
				},
				{
					name: 'Kitchen Sink',
					type: 'PLUMBING',
					unitId: unit101.id,
					siteId: site.id
				}
			]
		});
	}

	console.log('✅ Demo data seeded successfully!');
	console.log('\nDemo Accounts:');
	console.log('  Admin: admin@demo.com / Demo123!@#');
	console.log('  Tech:  tech@demo.com / Demo123!@#');
}

main()
	.catch((e) => {
		console.error('❌ Error seeding demo data:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});