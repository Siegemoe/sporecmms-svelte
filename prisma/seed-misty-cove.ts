const clientPromise = (async () => {
  const { createNodePrismaClient } = await import('../src/lib/server/prisma.js');
  return createNodePrismaClient();
})();

async function main() {
	// Get your org (the one you registered with)
	const prisma = await clientPromise;
	const user = await prisma.user.findFirst({
		where: { email: { contains: '' } }, // Gets first user
		select: { organizationId: true, email: true }
	});

	if (!user) {
		console.error('No user found! Register first.');
		process.exit(1);
	}

	console.log(`Seeding for org: ${user.orgId} (user: ${user.email})`);

	// Create site
	const site = await prisma.site.create({
		data: {
			name: 'Misty Cove',
			orgId: user.orgId
		}
	});
	console.log(`✅ Created site: ${site.name}`);

	// Create rooms 101-133
	const rooms = [];
	for (let i = 101; i <= 133; i++) {
		rooms.push({
			name: `Room ${i}`,
			building: 'Main',
			floor: 1,
			siteId: site.id
		});
	}

	await prisma.room.createMany({ data: rooms });
	console.log(`✅ Created ${rooms.length} rooms (101-133)`);

	console.log('\n🌿 Misty Cove seeded successfully!');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		const prisma = await clientPromise;
		await prisma.$disconnect();
	});
