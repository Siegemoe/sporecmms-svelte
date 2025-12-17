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
			buildings: {
				orderBy: { name: 'asc' }
			},
			units: {
				orderBy: [
					{ building: { name: 'asc' } },
					{ floor: 'asc' },
					{ roomNumber: 'asc' }
				],
				include: {
					building: {
						select: { name: true }
					},
					_count: {
						select: { assets: true }
					}
				}
			},
			_count: {
				select: {
					buildings: true,
					units: true,
					assets: true
				}
			}
		}
	});

	if (!site) {
		throw error(404, 'Site not found');
	}

	// Group units by building
	const unitsByBuilding = site.units.reduce((acc, unit) => {
		const building = unit.building?.name || 'Unassigned';
		if (!acc[building]) {
			acc[building] = [];
		}
		acc[building].push(unit);
		return acc;
	}, {} as Record<string, typeof site.units>);

	return { site, unitsByBuilding };
};

export const actions = {
	createUnit: async (event: import('./$types').RequestEvent) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		const { id: siteId } = event.params;

		const roomNumber = formData.get('roomNumber') as string;
		const name = formData.get('name') as string;
		const floor = formData.get('floor') as string;
		const buildingId = formData.get('buildingId') as string;

		if (!roomNumber || roomNumber.trim() === '') {
			return fail(400, { error: 'Room number is required' });
		}

		// Verify building belongs to this site if provided
		if (buildingId) {
			const building = await prisma.building.findFirst({
				where: { id: buildingId, siteId }
			});
			if (!building) {
				return fail(400, { error: 'Invalid building' });
			}
		}

		const unit = await prisma.unit.create({
			data: {
				roomNumber: roomNumber.trim(),
				name: name?.trim() || null,
				floor: floor ? parseInt(floor) : null,
				siteId,
				buildingId: buildingId || null
			}
		});

		return { success: true, unit };
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

	deleteUnit: async (event: import('./$types').RequestEvent) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();

		const unitId = formData.get('unitId') as string;

		if (!unitId) {
			return fail(400, { error: 'Unit ID is required' });
		}

		await prisma.unit.delete({
			where: { id: unitId }
		});

		return { success: true };
	},

	createBuilding: async (event: import('./$types').RequestEvent) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		const { id: siteId } = event.params;

		const name = formData.get('name') as string;
		const description = formData.get('description') as string;

		if (!name || name.trim() === '') {
			return fail(400, { error: 'Building name is required' });
		}

		const building = await prisma.building.create({
			data: {
				name: name.trim(),
				description: description?.trim() || null,
				siteId
			}
		});

		return { success: true, building };
	},

	updateUnit: async (event: import('./$types').RequestEvent) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();

		const unitId = formData.get('unitId') as string;
		const roomNumber = formData.get('roomNumber') as string;
		const name = formData.get('name') as string;
		const floor = formData.get('floor') as string;
		const buildingId = formData.get('buildingId') as string;

		if (!unitId) {
			return fail(400, { error: 'Unit ID is required' });
		}

		if (!roomNumber || roomNumber.trim() === '') {
			return fail(400, { error: 'Room number is required' });
		}

		// Get the unit to verify site
		const existingUnit = await prisma.unit.findUnique({
			where: { id: unitId },
			select: { siteId: true }
		});

		if (!existingUnit || existingUnit.siteId !== event.params.id) {
			return fail(404, { error: 'Unit not found' });
		}

		// Verify building belongs to this site if provided
		if (buildingId) {
			const building = await prisma.building.findFirst({
				where: { id: buildingId, siteId: event.params.id }
			});
			if (!building) {
				return fail(400, { error: 'Invalid building' });
			}
		}

		const unit = await prisma.unit.update({
			where: { id: unitId },
			data: {
				roomNumber: roomNumber.trim(),
				name: name?.trim() || null,
				floor: floor ? parseInt(floor) : null,
				buildingId: buildingId || null
			}
		});

		return { success: true, unit };
	}
};
;null as any as Actions;