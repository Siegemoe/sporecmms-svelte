import type { PageServerLoad, Actions } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';
import { requireAuth, isManagerOrAbove } from '$lib/server/guards';
import { logAudit } from '$lib/server/audit';

export const load: PageServerLoad = async (event) => {
	requireAuth(event);

	const prisma = await createRequestPrisma(event);
	const roomFilter = event.url.searchParams.get('room');
	const orgId = event.locals.user!.orgId;

	const assets = await prisma.asset.findMany({
		where: {
			room: {
				site: {
					orgId
				}
			},
			...(roomFilter && { roomId: roomFilter })
		},
		orderBy: { createdAt: 'desc' },
		include: {
			room: {
				include: {
					site: {
						select: { name: true }
					},
					building: {
						select: { name: true }
					}
				}
			},
			_count: {
				select: { workOrders: true }
			}
		}
	});

	// Get all rooms for the create form dropdown
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
			site: {
				select: { name: true }
			},
			building: {
				select: { name: true }
			}
		}
	});

	return { assets, rooms, roomFilter };
};

export const actions: Actions = {
	create: async (event) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();

		const name = formData.get('name') as string;
		const roomId = formData.get('roomId') as string;
		const orgId = event.locals.user!.orgId;

		if (!name || name.trim() === '') {
			return fail(400, { error: 'Asset name is required' });
		}

		if (!roomId) {
			return fail(400, { error: 'Room is required' });
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

		const asset = await prisma.asset.create({
			data: {
				name: name.trim(),
				roomId
			}
		});

		await logAudit(event.locals.user!.id, 'ASSET_CREATED', {
			assetId: asset.id,
			name: asset.name,
			roomId
		});

		return { success: true, asset };
	},

	delete: async (event) => {
		// Only Admin/Manager can delete assets
		if (!isManagerOrAbove(event)) {
			return fail(403, { error: 'Permission denied. Only managers can delete assets.' });
		}

		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		const orgId = event.locals.user!.orgId;

		const assetId = formData.get('assetId') as string;

		if (!assetId) {
			return fail(400, { error: 'Asset ID is required' });
		}

		// Get asset details before deletion for audit
		const asset = await prisma.asset.findFirst({
			where: {
				id: assetId,
				room: {
					site: {
						orgId
					}
				}
			},
			select: { name: true }
		});

		if (!asset) {
			return fail(404, { error: 'Asset not found' });
		}

		await prisma.asset.delete({
			where: { id: assetId }
		});

		await logAudit(event.locals.user!.id, 'ASSET_DELETED', {
			assetId,
			name: asset?.name
		});

		return { success: true };
	},

	update: async (event) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		const orgId = event.locals.user!.orgId;

		const assetId = formData.get('assetId') as string;
		const name = formData.get('name') as string;
		const roomId = formData.get('roomId') as string;

		if (!assetId) {
			return fail(400, { error: 'Asset ID is required' });
		}

		if (!name || name.trim() === '') {
			return fail(400, { error: 'Asset name is required' });
		}

		if (!roomId) {
			return fail(400, { error: 'Room is required' });
		}

		// Verify the asset and room belong to the user's org
		const existingAsset = await prisma.asset.findFirst({
			where: {
				id: assetId,
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
			where: { id: assetId },
			data: {
				name: name.trim(),
				roomId
			}
		});

		return { success: true, asset };
	}
};
