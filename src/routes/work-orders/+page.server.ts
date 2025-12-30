import type { Actions, PageServerLoad } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import { broadcastToOrg } from '$lib/server/websocket-handler';
import { WorkOrderStatus, Priority } from '@prisma/client';
import { requireAuth, isManagerOrAbove } from '$lib/server/guards';
import { fail } from '@sveltejs/kit';
import { logAudit } from '$lib/server/audit';
import { PRIORITY_ORDER, PRIORITIES, DEFAULT_PRIORITY } from '$lib/constants';

export const load: PageServerLoad = async (event) => {
	requireAuth(event);

	const prisma = await createRequestPrisma(event);
	const userId = event.locals.user!.id;
	const organizationId = event.locals.user!.organizationId;

	// Parse Query Params
	const myOnly = event.url.searchParams.get('my') === 'true';
	const status = event.url.searchParams.get('status');
	const priority = event.url.searchParams.get('priority');
	const siteId = event.url.searchParams.get('siteId');
	const sort = event.url.searchParams.get('sort') || 'dueDate';
	const search = event.url.searchParams.get('search');

	// Build Where Clause
	const where: any = {
		organizationId // Implicitly enforced by extension, but explicit is cleaner
	};

	if (myOnly) where.assignedToId = userId;
	if (status) where.status = status as WorkOrderStatus;
	if (priority) where.priority = priority as Priority;
	if (siteId) where.siteId = siteId;

	// Add search condition (fuzzy search on title and description)
	if (search && search.trim()) {
		where.OR = [
			{ title: { contains: search.trim(), mode: 'insensitive' } },
			{ description: { contains: search.trim(), mode: 'insensitive' } }
		];
	}

	// Build OrderBy - note: priority sort is handled in-memory after fetch
	let orderBy: any = [];
	if (sort === 'priority') {
		// Priority sort handled in-memory after fetch for proper ordering
		orderBy = { createdAt: 'desc' }; // Fallback sort for database
	} else if (sort === 'created') {
		orderBy = { createdAt: 'desc' };
	} else if (sort === 'updated') {
		orderBy = { updatedAt: 'desc' };
	} else {
		// Default: Due Date asc, then by createdAt
		orderBy = [
			{ dueDate: 'asc' },
			{ createdAt: 'desc' }
		];
	}

	const workOrders = await prisma.workOrder.findMany({
		where,
		include: {
			Asset: {
				select: {
					id: true,
					name: true
				}
			},
			Building: {
				select: {
					id: true,
					name: true,
					Site: {
						select: {
							name: true
						}
					}
				}
			},
			Unit: {
				select: {
					id: true,
					roomNumber: true,
					name: true,
					Building: {
						select: {
							name: true
						}
					},
					Site: {
						select: {
							name: true
						}
					}
				}
			},
			Site: {
				select: {
					id: true,
					name: true
				}
			}
		},
		orderBy
	});

	// Get assets for the create form
	const assets = await prisma.asset.findMany({
		where: {
			Unit: {
				Site: {
					organizationId: organizationId ?? undefined
				}
			}
		},
		include: {
			Unit: {
				include: {
					Site: { select: { name: true } },
					Building: { select: { name: true } }
				}
			}
		},
		orderBy: { name: 'asc' }
	});

	// Get units for the create form
	const units = await prisma.unit.findMany({
		where: {
			Site: {
				organizationId: organizationId ?? undefined
			}
		},
		include: {
			Site: { select: { name: true } },
			Building: { select: { name: true } }
		},
		orderBy: [
			{ Site: { name: 'asc' } },
			{ Building: { name: 'asc' } },
			{ roomNumber: 'asc' }
		]
	});

	// Get buildings for the create form
	const buildings = await prisma.building.findMany({
		where: {
			Site: {
				organizationId: organizationId ?? undefined
			}
		},
		include: {
			Site: { select: { name: true } }
		},
		orderBy: [
			{ Site: { name: 'asc' } },
			{ name: 'asc' }
		]
	});

	// Get sites for the create form and filters
	const sites = await prisma.site.findMany({
		where: {
			organizationId: organizationId ?? undefined
		},
		orderBy: { name: 'asc' }
	});

	// Get users for assignment dropdown
	const users = await prisma.user.findMany({
		where: { organizationId: organizationId ?? undefined },
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true
		},
		orderBy: { firstName: 'asc' }
	});

	// Transform data for frontend compatibility (PascalCase -> lowercase)
	const transformedWorkOrders = workOrders.map(wo => ({
		...wo,
		asset: wo.Asset,
		building: wo.Building,
		unit: wo.Unit,
		site: wo.Site,
		// Remove PascalCase versions
		Asset: undefined,
		Building: undefined,
		Unit: undefined,
		Site: undefined
	}));

	// Apply in-memory sorting for priority (since Prisma sorts enums alphabetically)
	if (sort === 'priority') {
		transformedWorkOrders.sort((a, b) => {
			const aOrder = PRIORITY_ORDER[a.priority] ?? 999;
			const bOrder = PRIORITY_ORDER[b.priority] ?? 999;
			if (aOrder !== bOrder) return aOrder - bOrder;
			// Secondary sort by creation date (newest first)
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});
	}

	const transformedAssets = assets.map(asset => ({
		...asset,
		room: asset.Unit ? {
			...asset.Unit,
			name: asset.Unit.name || asset.Unit.roomNumber,
			site: asset.Unit.Site,
			building: asset.Unit.Building
		} : null,
		Unit: undefined
	}));

	const transformedUnits = units.map(unit => ({
		...unit,
		Site: undefined,
		Building: undefined
	}));

	const transformedBuildings = buildings.map(building => ({
		...building,
		Site: undefined
	}));

	return {
		workOrders: transformedWorkOrders,
		assets: transformedAssets,
		units: transformedUnits,
		buildings: transformedBuildings,
		sites,
		users,
		myOnly, status, priority, siteId, sort, search
	};
};

export const actions: Actions = {
	/**
	 * Create a new Work Order
	 */
	create: async (event) => {
		const prisma = await createRequestPrisma(event);
		const data = await event.request.formData();

		const title = data.get('title') as string;
		const description = data.get('description') as string;
		const priority = data.get('priority') as string || DEFAULT_PRIORITY;
		const dueDate = data.get('dueDate') as string;
		const assignedToId = data.get('assignedToId') as string;
		const selectionMode = data.get('selectionMode') as string || 'asset';

		// Selection inputs
		const assetId = data.get('assetId') as string;
		const unitId = (data.get('unitId') || data.get('roomId')) as string;
		const buildingId = data.get('buildingId') as string;
		const siteId = data.get('siteId') as string;

		// Validate title
		if (!title?.trim()) {
			return fail(400, { error: 'Title is required.' });
		}

		// Validate priority enum
		if (!PRIORITIES.includes(priority as Priority)) {
			return fail(400, { error: 'Invalid priority value.' });
		}

		// Validate and sanitize description
		const trimmedDescription = description?.trim() || '';
		if (trimmedDescription.length > 5000) {
			return fail(400, { error: 'Description is too long (max 5000 characters).' });
		}

		// Validate dueDate format if provided
		if (dueDate) {
			const parsedDate = new Date(dueDate);
			if (isNaN(parsedDate.getTime())) {
				return fail(400, { error: 'Invalid due date format.' });
			}
		}

		// Validate at least one selection is made
		if (!assetId && !unitId && !buildingId && !siteId) {
			return fail(400, { error: 'Please select an asset, unit, building, or site.' });
		}

		// Validate assigned user belongs to same organization
		if (assignedToId) {
			const assignedUser = await prisma.user.findUnique({
				where: { id: assignedToId },
				select: { organizationId: true }
			});
			if (!assignedUser || assignedUser.organizationId !== event.locals.user!.organizationId) {
				return fail(400, { error: 'Invalid user assignment.' });
			}
		}

		try {
			const organizationId = event.locals.user!.organizationId;
			const createdById = event.locals.user!.id;

			// Create work order with appropriate relationships
			const newWo = await prisma.workOrder.create({
				data: {
					title: title.trim(),
					description: trimmedDescription,
					priority: priority as any,
					dueDate: dueDate ? new Date(dueDate) : null,
					organizationId: organizationId!, // Ensure non-null
					createdById,
					assignedToId: assignedToId || null,
					status: 'PENDING',
					updatedAt: new Date(),
					// Only set the relevant ID based on selection mode
					...(selectionMode === 'asset' && { assetId }),
					...((selectionMode === 'unit' || selectionMode === 'room') && { unitId }),
					...(selectionMode === 'building' && { buildingId }),
					...(selectionMode === 'site' && { siteId })
				},
				select: {
					id: true,
					title: true,
					status: true,
					assetId: true,
					buildingId: true,
					unitId: true,
					siteId: true,
					organizationId: true,
					createdAt: true,
					priority: true,
					dueDate: true
				}
			});

			// Broadcast to all connected clients
			broadcastToOrg(organizationId!, {
				type: 'WO_NEW',
				payload: newWo
			});

			// Audit log
			await logAudit(event.locals.user!.id, 'WORK_ORDER_CREATED', {
				workOrderId: newWo.id,
				title: newWo.title,
				priority: newWo.priority,
				dueDate: newWo.dueDate,
				selectionMode,
				selectionDetails: selectionMode === 'asset' ? { assetId } :
					(selectionMode === 'unit' || selectionMode === 'room') ? { unitId } :
					selectionMode === 'building' ? { buildingId } :
					selectionMode === 'site' ? { siteId } :
					{}
			});

			return { success: true, workOrder: newWo };
		} catch (e) {
			console.error('Error creating work order:', e);
			return { success: false, error: 'Failed to create work order.' };
		}
	},

	/** * Handles updating the status of a Work Order.
	 * This is the core workflow trigger for the real-time system.
	 */
	updateStatus: async (event) => {
		const { request } = event;
		const prisma = await createRequestPrisma(event);
		const data = await request.formData();
		const woId = data.get('workOrderId') as string;
		const newStatus = data.get('status') as WorkOrderStatus;

		if (!woId || !newStatus) {
			return { success: false, error: 'Missing ID or status.' };
		}

		try {
			// 1. DATABASE UPDATE: Uses the secure Prisma client.
			//    Middleware automatically filters by the user's organizationId.
			const updatedWo = await prisma.workOrder.update({
				where: { id: woId },
				data: { status: newStatus },
				// Select specific fields for the broadcast payload
				select: {
					id: true,
					title: true,
					status: true,
					assetId: true,
					organizationId: true
				}
			});

			if (!updatedWo) {
				return { success: false, error: 'Work order not found.' };
			}

			// 2. REAL-TIME BROADCAST: Push the change instantly to all connected clients in the same organization.
			broadcastToOrg(updatedWo.organizationId, {
				type: 'WO_UPDATE',
				payload: updatedWo
			});

			// Audit log
			await logAudit(event.locals.user!.id, 'WORK_ORDER_STATUS_CHANGED', {
				workOrderId: updatedWo.id,
				title: updatedWo.title,
				newStatus
			});

			return { success: true, updatedWo };
		} catch (e) {
			console.error('Error updating WO status:', e);
			return { success: false, error: 'Database transaction failed.' };
		}
	},

	assign: async (event) => {
		const prisma = await createRequestPrisma(event);
		const data = await event.request.formData();
		
		const woId = data.get('workOrderId') as string;
		const assignedToId = data.get('assignedToId') as string;

		if (!woId) {
			return fail(400, { error: 'Work order ID required' });
		}

		try {
			const updatedWo = await prisma.workOrder.update({
				where: { id: woId },
				data: { assignedToId: assignedToId || null },
				select: {
					id: true,
					title: true,
					status: true,
					assignedToId: true,
					organizationId: true
				}
			});

			broadcastToOrg(updatedWo.organizationId, {
				type: 'WO_UPDATE',
				payload: updatedWo
			});

			// Audit log
			await logAudit(event.locals.user!.id, 'WORK_ORDER_ASSIGNED', {
				workOrderId: updatedWo.id,
				title: updatedWo.title,
				assignedToId: assignedToId || null
			});

			return { success: true };
		} catch (e) {
			console.error('Error assigning WO:', e);
			return fail(500, { error: 'Failed to assign work order' });
		}
	}
};