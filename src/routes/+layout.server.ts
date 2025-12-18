import type { LayoutServerLoad } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Get data for Quick FAB if user is authenticated and has organization
	let assets = [];
	let buildings = [];
	let rooms = [];

	if (locals.user && locals.authState === 'org_member') {
		const prisma = await createRequestPrisma({ locals } as any);

		// Get assets
		assets = await prisma.asset.findMany({
			where: {
				unit: {
					site: {
						                        organizationId: locals.user.organizationId

					}
				}
			},
			include: {
				unit: {
					include: {
						building: {
							select: {
								id: true,
								name: true
							}
						},
						site: {
							select: {
								name: true
							}
						}
					}
				}
			},
			orderBy: {
				name: 'asc'
			},
			take: 35 // Limit to keep it performant
		});

		// Get buildings
		buildings = await prisma.building.findMany({
			where: {
				site: {
					                        organizationId: locals.user.organizationId

				}
			},
			include: {
				site: {
					select: {
						name: true
					}
				}
			},
			orderBy: {
				name: 'asc'
			},
			take: 35 // Limit to keep it performant
		});

		// Get rooms (units)
		rooms = await prisma.unit.findMany({
			where: {
				site: {
					                        organizationId: locals.user.organizationId

				}
			},
			include: {
				building: {
					select: {
						id: true,
						name: true
					}
				},
				site: {
					select: {
						name: true
					}
				}
			},
			orderBy: {
				roomNumber: 'asc'
			},
			take: 35 // Limit to keep it performant
		});
	}

	return {
		user: locals.user ?? null,
		authState: locals.authState,
		organizations: locals.organizations,
		currentOrganization: locals.currentOrganization,
		assets: assets.map(asset => ({
			id: asset.id,
			name: asset.name,
			room: asset.unit ? {
				id: asset.unit.id,
				name: asset.unit.name || asset.unit.roomNumber,
				building: asset.unit.building,
				site: asset.unit.site ? {
					name: asset.unit.site.name
				} : undefined
			} : undefined
		})),
		buildings: buildings.map(building => ({
			id: building.id,
			name: building.name,
			site: building.site ? {
				name: building.site.name
			} : undefined
		})),
		rooms: rooms.map(unit => ({
			id: unit.id,
			name: unit.name || unit.roomNumber,
			building: unit.building,
			site: unit.site ? {
				name: unit.site.name
			} : undefined
		}))
	};
};
