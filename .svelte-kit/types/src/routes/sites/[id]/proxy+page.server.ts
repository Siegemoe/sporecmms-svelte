// @ts-nocheck
import type { PageServerLoad, Actions } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import { fail, error } from '@sveltejs/kit';
import { requireAuth, isManagerOrAbove } from '$lib/server/guards';

export const load = async (event: Parameters<PageServerLoad>[0]) => {
	requireAuth(event);
	
	const prisma = await createRequestPrisma(event);
	const { id } = event.params;

	const site = await prisma.site.findUnique({
		where: { id },
		include: {
			rooms: {
				orderBy: [
					{ building: 'asc' },
					{ floor: 'asc' },
					{ name: 'asc' }
				],
				include: {
					_count: {
						select: { assets: true }
					}
				}
			}
		}
	});

	if (!site) {
		throw error(404, 'Site not found');
	}

	// Group rooms by building
	const roomsByBuilding = site.rooms.reduce((acc, room) => {
		const building = room.building || 'Unassigned';
		if (!acc[building]) {
			acc[building] = [];
		}
		acc[building].push(room);
		return acc;
	}, {} as Record<string, typeof site.rooms>);

	return { site, roomsByBuilding };
};

export const actions = {
	createRoom: async (event: import('./$types').RequestEvent) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		const { id: siteId } = event.params;
		
		const name = formData.get('name') as string;
		const building = formData.get('building') as string;
		const floor = formData.get('floor') as string;
		
		if (!name || name.trim() === '') {
			return fail(400, { error: 'Room name is required' });
		}

		const room = await prisma.room.create({
			data: {
				name: name.trim(),
				building: building?.trim() || null,
				floor: floor ? parseInt(floor) : null,
				siteId
			}
		});

		return { success: true, room };
	},

	updateSite: async (event: import('./$types').RequestEvent) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		const { id } = event.params;
		
		const name = formData.get('name') as string;
		
		if (!name || name.trim() === '') {
			return fail(400, { error: 'Site name is required' });
		}

		const site = await prisma.site.update({
			where: { id },
			data: { name: name.trim() }
		});

		return { success: true, site };
	},

	deleteRoom: async (event: import('./$types').RequestEvent) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		
		const roomId = formData.get('roomId') as string;
		
		if (!roomId) {
			return fail(400, { error: 'Room ID is required' });
		}

		await prisma.room.delete({
			where: { id: roomId }
		});

		return { success: true };
	},

	updateRoom: async (event: import('./$types').RequestEvent) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		
		const roomId = formData.get('roomId') as string;
		const name = formData.get('name') as string;
		const building = formData.get('building') as string;
		const floor = formData.get('floor') as string;
		
		if (!roomId) {
			return fail(400, { error: 'Room ID is required' });
		}
		
		if (!name || name.trim() === '') {
			return fail(400, { error: 'Room name is required' });
		}

		const room = await prisma.room.update({
			where: { id: roomId },
			data: {
				name: name.trim(),
				building: building?.trim() || null,
				floor: floor ? parseInt(floor) : null
			}
		});

		return { success: true, room };
	}
};
;null as any as Actions;