// Seed script - run with: node prisma/seed.js
const prismaPromise = (async () => {
  const { createNodePrismaClient } = await import('../src/lib/server/prisma.js');
  return createNodePrismaClient();
})();

async function main() {
	console.log('🌱 Seeding database...');

	// Create or find the test org
	const prisma = await prismaPromise;
	const org = await prisma.org.upsert({
		where: { id: 'org-123' },
		update: {},
		create: {
			id: 'org-123',
			name: 'Spore Test Organization'
		}
	});
	console.log('✅ Org:', org.name);

	// Create a site
	const site = await prisma.site.upsert({
		where: { id: 'site-1' },
		update: {},
		create: {
			id: 'site-1',
			name: 'Main Facility',
			orgId: org.id
		}
	});
	console.log('✅ Site:', site.name);

	// Create a room
	const room = await prisma.room.upsert({
		where: { id: 'room-1' },
		update: { name: '101', building: 'A', floor: 1 },
		create: {
			id: 'room-1',
			name: '101',
			building: 'A',
			floor: 1,
			siteId: site.id
		}
	});
	console.log('✅ Room:', room.name, `(Building ${room.building}, Floor ${room.floor})`);

	// Create an asset
	const asset = await prisma.asset.upsert({
		where: { id: 'asset-1' },
		update: {},
		create: {
			id: 'asset-1',
			name: 'HVAC Unit #1',
			roomId: room.id
		}
	});
	console.log('✅ Asset:', asset.name);

	// Create some work orders
	const workOrders = [
		{
			id: 'wo-1',
			title: 'HVAC Filter Replacement',
			description: 'Replace air filters on HVAC Unit #1',
			status: 'PENDING',
			failureMode: 'Preventive Maintenance',
			assetId: asset.id,
			orgId: org.id
		},
		{
			id: 'wo-2',
			title: 'Boiler Inspection',
			description: 'Annual boiler safety inspection',
			status: 'IN_PROGRESS',
			failureMode: 'Inspection',
			assetId: asset.id,
			orgId: org.id
		},
		{
			id: 'wo-3',
			title: 'Fix Leaking Pipe',
			description: 'Water leak detected near main valve',
			status: 'PENDING',
			failureMode: 'Corrective',
			assetId: asset.id,
			orgId: org.id
		}
	];

	for (const wo of workOrders) {
		const created = await prisma.workOrder.upsert({
			where: { id: wo.id },
			update: wo,
			create: wo
		});
		console.log('✅ Work Order:', created.title, `[${created.status}]`);
	}

	console.log('\\n🎉 Seeding complete!');
}

main()
	.catch((e) => {
		console.error('❌ Seed error:', e);
		process.exit(1);
	})
	.finally(async () => {
		const prisma = await prismaPromise;
		await prisma.$disconnect();
	});
