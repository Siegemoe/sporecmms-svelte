import type { LayoutServerLoad } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import type { Asset, Building, Unit } from '@prisma/client';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Get data for Quick FAB if user is authenticated and has organization
	let assets: Asset[] = [];
	let buildings: Building[] = [];
	let rooms: Unit[] = [];

	if (locals.user && locals.authState === 'org_member') {
		const prisma = await createRequestPrisma({ locals } as any);

		// Get assets
		assets = await prisma.asset.findMany({
			where: {
				Unit: {
					Site: {
						                        organizationId: locals.user.organizationId ?? undefined

					}
				}
			},
			include: {
				Unit: {
					include: {
						Building: true,
						Site: { select: { name: true } }
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
				Site: {
					                        organizationId: locals.user.organizationId ?? undefined

				}
			},
			include: {
				Site: true
			},
			orderBy: {
				name: 'asc'
			},
			take: 35 // Limit to keep it performant
		});

		// Get rooms (units)
		rooms = await prisma.unit.findMany({
			where: {
				Site: {
					                        organizationId: locals.user.organizationId ?? undefined

				}
			},
			include: {
				Building: true,
				Site: true
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
			room: asset.Unit ? {
				id: asset.Unit.id,
				name: asset.Unit.name || asset.Unit.roomNumber,
				building: asset.Unit.Building,
				site: asset.Unit.Site ? {
					name: asset.Unit.Site.name
				} : undefined
			} : undefined
		})),
		buildings: buildings.map(building => ({
			id: building.id,
			name: building.name,
			site: building.Site ? {
				name: building.Site.name
			} : undefined
		})),
		rooms: rooms.map(unit => ({
			id: unit.id,
			name: unit.name || unit.roomNumber,
			building: unit.Building,
			site: unit.Site ? {
				name: unit.Site.name
			} : undefined
		}))
	};
};
