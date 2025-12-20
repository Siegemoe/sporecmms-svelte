// @ts-nocheck
import type { Actions, PageServerLoad } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import { broadcastToOrg } from '$lib/server/websocket-handler';
import { WorkOrderStatus, Priority } from '@prisma/client';
import { requireAuth, isManagerOrAbove } from '$lib/server/guards';
import { fail } from '@sveltejs/kit';
import { logAudit } from '$lib/server/audit';

export const load = async (event: Parameters<PageServerLoad>[0]) => {
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

	// Build Where Clause
	const where: any = {
		organizationId // Implicitly enforced by extension, but explicit is cleaner
	};

	if (myOnly) where.assignedToId = userId;
	if (status) where.status = status as WorkOrderStatus;
	if (priority) where.priority = priority as Priority;
	if (siteId) where.siteId = siteId;

	// Build OrderBy
	let orderBy: any = [];
	if (sort === 'priority') {
		// High priority first (EMERGENCY -> HIGH -> MEDIUM -> LOW)
		// Prisma doesn't sort enums by definition index automatically easily without raw SQL
		// So we might rely on alphabetical or simple desc for now, or just name
		// Actually, standard practice is simple field sort. Enum sort requires specialized query or mapping.
		// For MVP, we'll sort by priority field desc (if Z-A works) or handle in client.
		// Let's stick to created/due/updated.
		orderBy = { priority: 'desc' };
	} else if (sort === 'created') {
		orderBy = { createdAt: 'desc' };
	} else if (sort === 'updated') {
		orderBy = { updatedAt: 'desc' };
	} else {
		// Default: Due Date asc, then Priority desc
		orderBy = [
			{ dueDate: 'asc' },
			{ priority: 'desc' }
		];
	}
	
	const workOrders = await prisma.workOrder.findMany({
		where,
		include: {
			asset: {
				select: {
					id: true,
					name: true
				}
			},
			building: {
				select: {
					id: true,
					name: true,
					site: {
						select: {
							name: true
						}
					}
				}
			},
			unit: {
				select: {
					id: true,
					roomNumber: true,
					name: true,
					building: {
						select: {
							name: true
						}
					},
					site: {
						select: {
							name: true
						}
					}
				}
			},
			site: {
				select: {
					id: true,
					name: true
				}
			},
			assignedTo: {
				select: {
					id: true,
					firstName: true,
					lastName: true
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
					organizationId
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
				organizationId
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
				organizationId
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
			organizationId
		},
		orderBy: { name: 'asc' }
	});

	// Get users for assignment dropdown
	const users = await prisma.user.findMany({
		where: { organizationId },
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true
		},
		orderBy: { firstName: 'asc' }
	});

	return { workOrders, assets, units, buildings, sites, users, myOnly, status, priority, siteId, sort };
};

export const actions = {
	/**
	 * Create a new Work Order
	 */
	create: async (event: import('./$types').RequestEvent) => {
		const prisma = await createRequestPrisma(event);
		const data = await event.request.formData();

		const title = data.get('title') as string;
		const description = data.get('description') as string;
		const priority = data.get('priority') as string || 'MEDIUM';
		const dueDate = data.get('dueDate') as string;
		const assignedToId = data.get('assignedToId') as string;
		const selectionMode = data.get('selectionMode') as string || 'asset';

		// Selection inputs
		const assetId = data.get('assetId') as string;
		const unitId = (data.get('unitId') || data.get('roomId')) as string;
		const buildingId = data.get('buildingId') as string;
		const siteId = data.get('siteId') as string;

		if (!title) {
			return { success: false, error: 'Title is required.' };
		}

		// Validate at least one selection is made
		if (!assetId && !unitId && !buildingId && !siteId) {
			return { success: false, error: 'Please select an asset, unit, building, or site.' };
		}

		try {
			const organizationId = event.locals.user!.organizationId;
			const createdById = event.locals.user!.id;

			// Create work order with appropriate relationships
			const newWo = await prisma.workOrder.create({
				data: {
					title: title.trim(),
					description: description?.trim() || '',
					priority: priority as any,
					dueDate: dueDate ? new Date(dueDate) : null,
					organizationId: organizationId!, // Ensure non-null
					createdById,
					assignedToId: assignedToId || null,
					status: 'PENDING',
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
	updateStatus: async (event: import('./$types').RequestEvent) => {
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

	assign: async (event: import('./$types').RequestEvent) => {
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
					organizationId: true,
					assignedTo: {
						select: { firstName: true, lastName: true }
					}
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
				assignedToId: assignedToId || null,
				assignedToName: updatedWo.assignedTo 
					? `${updatedWo.assignedTo.firstName || ''} ${updatedWo.assignedTo.lastName || ''}`.trim()
					: null
			});

			return { success: true };
		} catch (e) {
			console.error('Error assigning WO:', e);
			return fail(500, { error: 'Failed to assign work order' });
		}
	}
};;null as any as Actions;