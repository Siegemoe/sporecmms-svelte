// @ts-nocheck
import type { LayoutServerLoad } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';

export const load = async ({ locals }: Parameters<LayoutServerLoad>[0]) => {
	// Get assets for Quick FAB if user is authenticated
	let assets = [];
	if (locals.user) {
		const prisma = await createRequestPrisma({ locals } as any);
		assets = await prisma.asset.findMany({
			include: {
				room: {
					include: {
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
	}

	return {
		user: locals.user ?? null,
		assets: assets.map(asset => ({
			id: asset.id,
			name: asset.name,
			room: asset.room ? {
				site: asset.room.site ? {
					name: asset.room.site.name
				} : undefined
			} : undefined
		}))
	};
};
