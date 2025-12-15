// @ts-nocheck
import type { PageServerLoad, Actions } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import { fail, error, redirect } from '@sveltejs/kit';
import { requireAuth, isManagerOrAbove } from '$lib/server/guards';

export const load = async (event: Parameters<PageServerLoad>[0]) => {
	requireAuth(event);

	const prisma = await createRequestPrisma(event);
	const { id } = event.params;
	const orgId = event.locals.user!.orgId;

	const asset = await prisma.asset.findFirst({
		where: {
			id,
			room: {
				site: {
					orgId
				}
			}
		},
		include: {
			room: {
				include: {
					site: { select: { id: true, name: true } },
					building: { select: { id: true, name: true } }
				}
			},
			workOrders: {
				orderBy: { createdAt: 'desc' },
				take: 20,
				select: {
					id: true,
					title: true,
					status: true,
					failureMode: true,
					createdAt: true,
					updatedAt: true
				}
			},
			_count: {
				select: { workOrders: true }
			}
		}
	});

	if (!asset) {
		throw error(404, 'Asset not found');
	}

	// Get all rooms for edit dropdown
	const rooms = await prisma.room.findMany({
		where: {
			site: {
				orgId
			}
		},
		orderBy: [
			{ site: { name: 'asc' } },
			{ building: { name: 'asc' } },
			{ name: 'asc' }
		],
		include: {
			site: { select: { name: true } },
			building: { select: { name: true } }
		}
	});

	// Work order stats for this asset
	const [totalWO, pendingWO, inProgressWO, completedWO] = await Promise.all([
		prisma.workOrder.count({ where: { assetId: id } }),
		prisma.workOrder.count({ where: { assetId: id, status: 'PENDING' } }),
		prisma.workOrder.count({ where: { assetId: id, status: 'IN_PROGRESS' } }),
		prisma.workOrder.count({ where: { assetId: id, status: 'COMPLETED' } })
	]);

	return { 
		asset, 
		rooms,
		woStats: { total: totalWO, pending: pendingWO, inProgress: inProgressWO, completed: completedWO }
	};
};

export const actions = {
	update: async (event: import('./$types').RequestEvent) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		const { id } = event.params;
		const orgId = event.locals.user!.orgId;

		const name = formData.get('name') as string;
		const roomId = formData.get('roomId') as string;

		if (!name || name.trim() === '') {
			return fail(400, { error: 'Asset name is required' });
		}

		if (!roomId) {
			return fail(400, { error: 'Room is required' });
		}

		// Verify the asset belongs to the user's org
		const existingAsset = await prisma.asset.findFirst({
			where: {
				id,
				room: {
					site: {
						orgId
					}
				}
			}
		});

		if (!existingAsset) {
			return fail(404, { error: 'Asset not found' });
		}

		// Verify the room belongs to the user's org
		const room = await prisma.room.findFirst({
			where: {
				id: roomId,
				site: {
					orgId
				}
			}
		});

		if (!room) {
			return fail(404, { error: 'Room not found' });
		}

		const asset = await prisma.asset.update({
			where: { id },
			data: {
				name: name.trim(),
				roomId
			}
		});

		return { success: true, asset };
	},

	delete: async (event: import('./$types').RequestEvent) => {
		// Only Admin/Manager can delete assets
		if (!isManagerOrAbove(event)) {
			return fail(403, { error: 'Permission denied. Only managers can delete assets.' });
		}

		const prisma = await createRequestPrisma(event);
		const { id } = event.params;
		const orgId = event.locals.user!.orgId;

		// Verify the asset belongs to the user's org before deleting
		const asset = await prisma.asset.findFirst({
			where: {
				id,
				room: {
					site: {
						orgId
					}
				}
			}
		});

		if (!asset) {
			return fail(404, { error: 'Asset not found' });
		}

		await prisma.asset.delete({
			where: { id }
		});

		throw redirect(303, '/assets');
	}
};
;null as any as Actions;