import type { PageServerLoad, Actions } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';
import { requireAuth, isManagerOrAbove } from '$lib/server/guards';
import { logAudit } from '$lib/server/audit';

export const load: PageServerLoad = async (event) => {
	requireAuth(event);

	const prisma = await createRequestPrisma(event);
	const unitFilter = event.url.searchParams.get('unit');
	const organizationId = event.locals.user!.organizationId;

	const assets = await prisma.asset.findMany({
		where: {
			unit: {
				site: {
					organizationId
				}
			},
			...(unitFilter && { unitId: unitFilter })
		},
		orderBy: { createdAt: 'desc' },
		include: {
			unit: {
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

	// Get all units for the create form dropdown
	const units = await prisma.unit.findMany({
		where: {
			site: {
				organizationId
			}
		},
		orderBy: [
			{ site: { name: 'asc' } },
			{ building: { name: 'asc' } },
			{ roomNumber: 'asc' }
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

	return { assets, units, unitFilter };
};

export const actions: Actions = {
	create: async (event) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();

		const name = formData.get('name') as string;
		const unitId = formData.get('unitId') as string;
		const type = formData.get('type') as string;
		const status = formData.get('status') as string || 'OPERATIONAL';
		const description = formData.get('description') as string;
		const purchaseDate = formData.get('purchaseDate') as string;
		const warrantyExpiry = formData.get('warrantyExpiry') as string;
		const organizationId = event.locals.user!.organizationId;

		if (!name || name.trim() === '') {
			return fail(400, { error: 'Asset name is required' });
		}

		if (!unitId) {
			return fail(400, { error: 'Unit is required' });
		}

		// Verify the unit belongs to the user's org
		const unit = await prisma.unit.findFirst({
			where: {
				id: unitId,
				site: {
					organizationId
				}
			}
		});

		if (!unit) {
			return fail(404, { error: 'Unit not found' });
		}

		// Get site ID from unit
		const siteId = unit.siteId;

		const asset = await prisma.asset.create({
			data: {
				name: name.trim(),
				type: type as any,
				status: status as any,
				description: description?.trim() || null,
				purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
				warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
				unitId,
				siteId
			}
		});

		await logAudit(event.locals.user!.id, 'ASSET_CREATED', {
			assetId: asset.id,
			name: asset.name,
			unitId
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
		const organizationId = event.locals.user!.organizationId;

		const assetId = formData.get('assetId') as string;

		if (!assetId) {
			return fail(400, { error: 'Asset ID is required' });
		}

		// Get asset details before deletion for audit
		const asset = await prisma.asset.findFirst({
			where: {
				id: assetId,
				unit: {
					site: {
						organizationId
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
		const organizationId = event.locals.user!.organizationId;

		const assetId = formData.get('assetId') as string;
		const name = formData.get('name') as string;
		const unitId = formData.get('unitId') as string;
		const type = formData.get('type') as string;
		const status = formData.get('status') as string;
		const description = formData.get('description') as string;
		const purchaseDate = formData.get('purchaseDate') as string;
		const warrantyExpiry = formData.get('warrantyExpiry') as string;

		if (!assetId) {
			return fail(400, { error: 'Asset ID is required' });
		}

		if (!name || name.trim() === '') {
			return fail(400, { error: 'Asset name is required' });
		}

		if (!unitId) {
			return fail(400, { error: 'Unit is required' });
		}

		// Verify the asset and unit belong to the user's org
		const existingAsset = await prisma.asset.findFirst({
			where: {
				id: assetId,
				unit: {
					site: {
						organizationId
					}
				}
			}
		});

		if (!existingAsset) {
			return fail(404, { error: 'Asset not found' });
		}

		const unit = await prisma.unit.findFirst({
			where: {
				id: unitId,
				site: {
					organizationId
				}
			}
		});

		if (!unit) {
			return fail(404, { error: 'Unit not found' });
		}

		// Get site ID from unit
		const siteId = unit.siteId;

		const asset = await prisma.asset.update({
			where: { id: assetId },
			data: {
				name: name.trim(),
				type: type ? type as any : undefined,
				status: status ? status as any : undefined,
				description: description ? description.trim() : undefined,
				purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
				warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
				unitId,
				siteId
			}
		});

		return { success: true, asset };
	}
};