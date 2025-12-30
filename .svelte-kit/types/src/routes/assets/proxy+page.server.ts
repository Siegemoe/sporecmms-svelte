// @ts-nocheck
import type { PageServerLoad, Actions } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';
import { requireAuth, isManagerOrAbove } from '$lib/server/guards';
import { logAudit } from '$lib/server/audit';
import { assetSchema } from '$lib/validation';
import { ASSET_TYPES, ASSET_STATUSES } from '$lib/constants';

export const load = async (event: Parameters<PageServerLoad>[0]) => {
	requireAuth(event);

	const prisma = await createRequestPrisma(event);
	const organizationId = event.locals.user!.organizationId;

	// Get filter params
	const typeFilter = event.url.searchParams.get('type');
	const statusFilter = event.url.searchParams.get('status');
	const siteFilter = event.url.searchParams.get('siteId');
	const sortFilter = event.url.searchParams.get('sort') || 'created';

	// Build where clause for filters
	const where: any = {
		Unit: {
			Site: {
				organizationId: organizationId ?? undefined
			}
		}
	};

	if (typeFilter) where.type = typeFilter;
	if (statusFilter) where.status = statusFilter;
	if (siteFilter) where.siteId = siteFilter;

	// Determine sort order
	let orderBy: any = { createdAt: 'desc' };
	switch (sortFilter) {
		case 'name':
			orderBy = { name: 'asc' };
			break;
		case 'type':
			orderBy = [{ type: 'asc' }, { createdAt: 'desc' }];
			break;
		case 'status':
			orderBy = [{ status: 'asc' }, { createdAt: 'desc' }];
			break;
		case 'created':
		default:
			orderBy = { createdAt: 'desc' };
			break;
	}

	const assets = await prisma.asset.findMany({
		where,
		orderBy,
		include: {
			Unit: {
				include: {
					Site: {
						select: { name: true }
					},
					Building: {
						select: { name: true }
					}
				}
			},
			_count: {
				select: { WorkOrder: true }
			}
		}
	});

	// Get all units for the create form dropdown
	const units = await prisma.unit.findMany({
		where: {
			Site: {
				organizationId: organizationId ?? undefined
			}
		},
		orderBy: [
			{ Site: { name: 'asc' } },
			{ Building: { name: 'asc' } },
			{ roomNumber: 'asc' }
		],
		include: {
			Site: {
				select: { name: true }
			},
			Building: {
				select: { name: true }
			}
		}
	});

	// Get all sites for filter dropdown
	const sites = await prisma.site.findMany({
		where: {
			organizationId: organizationId ?? undefined
		},
		orderBy: { name: 'asc' },
		select: {
			id: true,
			name: true
		}
	});

	return {
		assets,
		units,
		sites,
		type: typeFilter,
		status: statusFilter,
		siteId: siteFilter,
		sort: sortFilter
	};
};

export const actions = {
	create: async (event: import('./$types').RequestEvent) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		const organizationId = event.locals.user!.organizationId;

		// Validate with Zod schema
		const rawData = {
			name: formData.get('name'),
			unitId: formData.get('unitId'),
			type: formData.get('type'),
			status: formData.get('status') || 'OPERATIONAL',
			description: formData.get('description'),
			purchaseDate: formData.get('purchaseDate'),
			warrantyExpiry: formData.get('warrantyExpiry')
		};

		const validationResult = assetSchema.safeParse(rawData);

		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			return fail(400, { error: firstError.message });
		}

		const data = validationResult.data;

		// Verify the unit belongs to the user's org
		const unit = await prisma.unit.findFirst({
			where: {
				id: data.unitId,
				Site: {
					organizationId: organizationId ?? undefined
				}
			}
		});

		if (!unit) {
			return fail(404, { error: 'Unit not found' });
		}

		const asset = await prisma.asset.create({
			data: {
				name: data.name.trim(),
				type: (data.type || 'OTHER') as typeof ASSET_TYPES[number],
				status: (data.status || 'OPERATIONAL') as typeof ASSET_STATUSES[number],
				description: data.description?.trim() || null,
				purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
				warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
				unitId: data.unitId,
				siteId: unit.siteId,
				updatedAt: new Date()
			}
		});

		await logAudit(event.locals.user!.id, 'ASSET_CREATED', {
			assetId: asset.id,
			name: asset.name,
			unitId: data.unitId
		});

		return { success: true, asset };
	},

	delete: async (event: import('./$types').RequestEvent) => {
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
				Unit: {
					Site: {
						organizationId: organizationId ?? undefined
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

	update: async (event: import('./$types').RequestEvent) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		const organizationId = event.locals.user!.organizationId;

		const assetId = formData.get('assetId') as string;

		// Validate with Zod schema
		const rawData = {
			name: formData.get('name'),
			unitId: formData.get('unitId'),
			type: formData.get('type'),
			status: formData.get('status'),
			description: formData.get('description'),
			purchaseDate: formData.get('purchaseDate'),
			warrantyExpiry: formData.get('warrantyExpiry')
		};

		const validationResult = assetSchema.safeParse(rawData);

		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			return fail(400, { error: firstError.message });
		}

		const data = validationResult.data;

		if (!assetId) {
			return fail(400, { error: 'Asset ID is required' });
		}

		// Verify the asset and unit belong to the user's org
		const existingAsset = await prisma.asset.findFirst({
			where: {
				id: assetId,
				Unit: {
					Site: {
						organizationId: organizationId ?? undefined
					}
				}
			}
		});

		if (!existingAsset) {
			return fail(404, { error: 'Asset not found' });
		}

		const unit = await prisma.unit.findFirst({
			where: {
				id: data.unitId,
				Site: {
					organizationId: organizationId ?? undefined
				}
			}
		});

		if (!unit) {
			return fail(404, { error: 'Unit not found' });
		}

		const asset = await prisma.asset.update({
			where: { id: assetId },
			data: {
				name: data.name.trim(),
				type: data.type ? data.type as typeof ASSET_TYPES[number] : undefined,
				status: data.status ? data.status as typeof ASSET_STATUSES[number] : undefined,
				description: data.description ? data.description.trim() : undefined,
				purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
				warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
				unitId: data.unitId,
				siteId: unit.siteId
			}
		});

		return { success: true, asset };
	}
};
;null as any as Actions;