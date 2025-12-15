// @ts-nocheck
import type { LayoutServerLoad } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';

export const load = async ({ locals }: Parameters<LayoutServerLoad>[0]) => {
	// Get data for Quick FAB if user is authenticated
	let assets = [];
	let buildings = [];
	let rooms = [];

	if (locals.user) {
		const prisma = await createRequestPrisma({ locals } as any);

		// Get assets
		assets = await prisma.asset.findMany({
			include: {
				room: {
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
			take: 50 // Limit to keep it performant
		});

		// Get buildings
		buildings = await prisma.building.findMany({
			include: {
				site: {
					select: {
						name: true
					}
				}
			},
			orderBy: {
				name: 'asc'
			}
		});

		// Get rooms
		rooms = await prisma.room.findMany({
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
				name: 'asc'
			}
		});
	}

	return {
		user: locals.user ?? null,
		assets: assets.map(asset => ({
			id: asset.id,
			name: asset.name,
			room: asset.room ? {
				id: asset.room.id,
				name: asset.room.name,
				building: asset.room.building,
				site: asset.room.site ? {
					name: asset.room.site.name
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
		rooms: rooms.map(room => ({
			id: room.id,
			name: room.name,
			building: room.building,
			site: room.site ? {
				name: room.site.name
			} : undefined
		}))
	};
};
