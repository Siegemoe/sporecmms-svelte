import type { Prisma, WorkOrderStatus, Priority } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import { broadcastToOrg } from '$lib/server/websocket-handler';
import { logAudit } from '$lib/server/audit';
import { canUpdateWorkOrder, canAssignWorkOrder, canDeleteWorkOrder } from '$lib/server/guards';
import { PRIORITY_ORDER, PRIORITIES } from '$lib/constants';
import type { RequestPrisma } from '$lib/types/prisma';
import { logError } from '$lib/server/logger';
import {
	transformWorkOrder,
	transformWorkOrders,
	transformAssetWithRoom,
	transformAssetsWithRoom,
	transformUnit,
	transformUnits,
	transformBuilding,
	transformBuildings
} from '$lib/server/transformers';

/**
 * Build where clause for work order queries based on filters
 */
export function buildWorkOrderWhere(filters: {
	organizationId: string;
	assignedToId?: string;
	status?: WorkOrderStatus;
	priority?: Priority;
	siteId?: string;
	search?: string;
}): Prisma.WorkOrderWhereInput {
	const where: Prisma.WorkOrderWhereInput = {
		organizationId: filters.organizationId
	};

	if (filters.assignedToId) {
		if (filters.assignedToId === 'unassigned') {
			where.assignedToId = null;
		} else {
			where.assignedToId = filters.assignedToId;
		}
	}
	if (filters.status) {
		where.status = filters.status;
	}
	if (filters.priority) {
		where.priority = filters.priority;
	}
	if (filters.siteId) {
		where.siteId = filters.siteId;
	}
	if (filters.search?.trim()) {
		where.OR = [
			{ title: { contains: filters.search.trim(), mode: 'insensitive' } },
			{ description: { contains: filters.search.trim(), mode: 'insensitive' } }
		];
	}

	return where;
}

/**
 * Build orderBy clause for work order queries
 */
export function buildWorkOrderOrderBy(
	sort: string
): Prisma.WorkOrderOrderByWithRelationInput | Prisma.WorkOrderOrderByWithRelationInput[] {
	if (sort === 'priority') {
		// Priority sort is handled in-memory after fetch
		return { createdAt: 'desc' };
	}
	if (sort === 'created') {
		return { createdAt: 'desc' };
	}
	if (sort === 'updated') {
		return { updatedAt: 'desc' };
	}
	// Default: Due Date asc, then by createdAt
	return [
		{ dueDate: 'asc' },
		{ createdAt: 'desc' }
	];
}

/**
 * Sort work orders by priority in-memory
 */
export function sortByPriority<T extends { priority: Priority; createdAt: Date }>(
	workOrders: T[]
): T[] {
	return workOrders.sort((a, b) => {
		const aOrder = PRIORITY_ORDER[a.priority] ?? 999;
		const bOrder = PRIORITY_ORDER[b.priority] ?? 999;
		if (aOrder !== bOrder) return aOrder - bOrder;
		// Secondary sort by creation date (newest first)
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});
}

/**
 * Query work orders with filters and sorting
 */
export async function queryWorkOrders(
	prisma: RequestPrisma,
	filters: {
		organizationId: string;
		assignedToId?: string;
		status?: WorkOrderStatus;
		priority?: Priority;
		siteId?: string;
		sort?: string;
		search?: string;
	}
) {
	const where = buildWorkOrderWhere(filters);
	const orderBy = buildWorkOrderOrderBy(filters.sort || 'dueDate');

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

	let transformed = transformWorkOrders(workOrders);

	if (filters.sort === 'priority') {
		transformed = sortByPriority(transformed);
	}

	return transformed;
}

/**
 * Query location options for the create form dropdowns
 */
export async function queryLocationOptions(prisma: RequestPrisma, organizationId: string | null | undefined) {
	const orgFilter = organizationId ?? undefined;

	const [assets, units, buildings, sites, users] = await Promise.all([
		prisma.asset.findMany({
			where: {
				Unit: {
					Site: {
						organizationId: orgFilter
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
		}),
		prisma.unit.findMany({
			where: {
				Site: {
					organizationId: orgFilter
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
		}),
		prisma.building.findMany({
			where: {
				Site: {
					organizationId: orgFilter
				}
			},
			include: {
				Site: { select: { name: true } }
			},
			orderBy: [
				{ Site: { name: 'asc' } },
				{ name: 'asc' }
			]
		}),
		prisma.site.findMany({
			where: {
				organizationId: orgFilter
			},
			orderBy: { name: 'asc' }
		}),
		prisma.user.findMany({
			where: { organizationId: orgFilter },
			select: {
				id: true,
				firstName: true,
				lastName: true,
				email: true
			},
			orderBy: { firstName: 'asc' }
		})
	]);

	return {
		assets: transformAssetsWithRoom(assets),
		units: transformUnits(units),
		buildings: transformBuildings(buildings),
		sites,
		users
	};
}

/**
 * Query a single work order by ID with full relations
 */
export async function queryWorkOrderById(prisma: RequestPrisma, id: string) {
	const workOrder = await prisma.workOrder.findUnique({
		where: { id },
		include: {
			Asset: {
				include: {
					Unit: {
						include: {
							Site: { select: { id: true, name: true } },
							Building: { select: { id: true, name: true } }
						}
					}
				}
			}
		}
	});

	if (!workOrder) {
		return null;
	}

	return transformWorkOrder(workOrder);
}

/**
 * Query assets for dropdown
 */
export async function queryAssetsForDropdown(prisma: RequestPrisma, organizationId: string | null | undefined) {
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
					Site: { select: { name: true } }
				}
			}
		},
		orderBy: { name: 'asc' }
	});

	return transformAssetsWithRoom(assets);
}

/**
 * Check if user can update a work order
 */
export function assertCanUpdateWorkOrder(
	event: RequestEvent,
	workOrder: { createdById: string; assignedToId: string | null }
): void {
	const userId = event.locals.user?.id;
	const userRole = event.locals.user?.role;

	if (!userId || !userRole) {
		throw fail(401, { error: 'Authentication required' });
	}

	if (!canUpdateWorkOrder(userId, userRole, workOrder.createdById, workOrder.assignedToId)) {
		throw fail(403, { error: 'You do not have permission to update this work order' });
	}
}

/**
 * Check if user can assign work orders
 */
export function assertCanAssignWorkOrder(event: RequestEvent): void {
	const userRole = event.locals.user?.role;

	if (!userRole) {
		throw fail(401, { error: 'Authentication required' });
	}

	if (!canAssignWorkOrder(userRole)) {
		throw fail(403, { error: 'Only managers and admins can assign work orders' });
	}
}

/**
 * Check if user can delete a work order
 */
export function assertCanDeleteWorkOrder(event: RequestEvent): void {
	const userRole = event.locals.user?.role;

	if (!userRole) {
		throw fail(401, { error: 'Authentication required' });
	}

	if (!canDeleteWorkOrder(userRole)) {
		throw fail(403, { error: 'Only managers and admins can delete work orders' });
	}
}

/**
 * Validate assigned user belongs to the same organization
 */
export async function validateAssignedUser(
	prisma: RequestPrisma,
	assignedToId: string | null | undefined,
	organizationId: string
): Promise<boolean> {
	if (!assignedToId) {
		return true;
	}

	const assignedUser = await prisma.user.findUnique({
		where: { id: assignedToId },
		select: { organizationId: true }
	});

	return assignedUser?.organizationId === organizationId;
}

/**
 * Create a new work order
 */
export async function createWorkOrder(
	event: RequestEvent,
	prisma: RequestPrisma,
	data: {
		title: string;
		description?: string;
		priority: Priority;
		dueDate?: Date | null;
		assignedToId?: string | null;
		selectionMode: 'asset' | 'unit' | 'building' | 'site';
		assetId?: string;
		unitId?: string;
		buildingId?: string;
		siteId?: string;
		checklistItems?: Array<{ title: string }>;
	}
) {
	const organizationId = event.locals.user!.organizationId;
	const createdById = event.locals.user!.id;

	if (!organizationId) {
		return fail(400, { error: 'Organization required.' });
	}

	// Validate assigned user
	const isValidAssignment = await validateAssignedUser(
		prisma,
		data.assignedToId || null,
		organizationId
	);
	if (!isValidAssignment) {
		return fail(400, { error: 'Invalid user assignment.' });
	}

	try {
		const newWo = await prisma.workOrder.create({
			data: {
				title: data.title.trim(),
				description: data.description?.trim() || '',
				priority: data.priority,
				dueDate: data.dueDate || null,
				organizationId,
				createdById,
				assignedToId: data.assignedToId || null,
				status: 'PENDING',
				updatedAt: new Date(),
				...(data.selectionMode === 'asset' && { assetId: data.assetId }),
				...(data.selectionMode === 'unit' && { unitId: data.unitId }),
				...(data.selectionMode === 'building' && { buildingId: data.buildingId }),
				...(data.selectionMode === 'site' && { siteId: data.siteId })
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

		// Create checklist items if provided
		if (data.checklistItems && data.checklistItems.length > 0) {
			const checklistItems = data.checklistItems.map((item, index) => ({
				title: item.title.trim(),
				position: index,
				workOrderId: newWo.id
			}));

			await prisma.workOrderChecklistItem.createMany({
				data: checklistItems
			});
		}

		// Broadcast to all connected clients
		broadcastToOrg(organizationId, {
			type: 'WO_NEW',
			payload: newWo
		});

		// Audit log
		await logAudit(createdById, 'WORK_ORDER_CREATED', {
			workOrderId: newWo.id,
			title: newWo.title,
			priority: newWo.priority,
			dueDate: newWo.dueDate,
			selectionMode: data.selectionMode,
			checklistItemCount: data.checklistItems?.length || 0,
			selectionDetails:
				data.selectionMode === 'asset' ? { assetId: data.assetId }
				: data.selectionMode === 'unit' ? { unitId: data.unitId }
				: data.selectionMode === 'building' ? { buildingId: data.buildingId }
				: data.selectionMode === 'site' ? { siteId: data.siteId }
				: {}
		});

		return { success: true, workOrder: newWo };
	} catch (e) {
		logError('Error creating work order', e, { title: data.title });
		// Return a standardized error object instead of just { success: false }
		// The controller layer can then decide how to present this (e.g. fail(500))
		return { success: false, error: 'Failed to create work order due to a database error.' };
	}
}

/**
 * Update work order status
 */
export async function updateWorkOrderStatus(
	event: RequestEvent,
	prisma: RequestPrisma,
	workOrderId: string,
	newStatus: WorkOrderStatus,
	reason?: string
) {
	const userId = event.locals.user!.id;

	try {
		// First fetch to check authorization and get current status
		const existing = await prisma.workOrder.findUnique({
			where: { id: workOrderId },
			select: { createdById: true, assignedToId: true, status: true }
		});

		if (!existing) {
			return { success: false, error: 'Work order not found.' };
		}

		// Check authorization
		assertCanUpdateWorkOrder(event, existing);

		// Record status history before updating
		const { recordStatusChange } = await import('./status-history');
		await recordStatusChange(prisma, workOrderId, existing.status, newStatus, userId, reason);

		const updatedWo = await prisma.workOrder.update({
			where: { id: workOrderId },
			data: { status: newStatus },
			select: {
				id: true,
				title: true,
				status: true,
				assetId: true,
				organizationId: true
			}
		});

		// Broadcast real-time update
		broadcastToOrg(updatedWo.organizationId, {
			type: 'WO_UPDATE',
			payload: updatedWo
		});

		// Audit log
		await logAudit(userId, 'WORK_ORDER_STATUS_CHANGED', {
			workOrderId: updatedWo.id,
			title: updatedWo.title,
			fromStatus: existing.status,
			toStatus: newStatus,
			reason
		});

		return { success: true, updatedWo };
	} catch (e) {
		if (e && typeof e === 'object' && 'status' in e) {
			// Re-throw fail() responses (authorization errors)
			throw e;
		}
		logError('Error updating WO status', e, { workOrderId, newStatus });
		return { success: false, error: 'Failed to update status due to a database error.' };
	}
}

/**
 * Assign a work order to a user
 */
export async function assignWorkOrder(
	event: RequestEvent,
	prisma: RequestPrisma,
	workOrderId: string,
	assignedToId: string | null
) {
	const userId = event.locals.user!.id;
	const organizationId = event.locals.user!.organizationId;

	if (!organizationId) {
		return fail(400, { error: 'Organization required.' });
	}

	// Check authorization
	assertCanAssignWorkOrder(event);

	try {
		// Validate assignment target
		if (assignedToId) {
			const isValid = await validateAssignedUser(
				prisma,
				assignedToId,
				organizationId
			);
			if (!isValid) {
				return fail(400, { error: 'Cannot assign to user outside your organization' });
			}
		}

		const updatedWo = await prisma.workOrder.update({
			where: { id: workOrderId },
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
		await logAudit(userId, 'WORK_ORDER_ASSIGNED', {
			workOrderId: updatedWo.id,
			title: updatedWo.title,
			assignedToId: assignedToId || null
		});

		return { success: true };
	} catch (e) {
		if (e && typeof e === 'object' && 'status' in e) {
			// Re-throw fail() responses
			throw e;
		}
		logError('Error assigning WO', e, { workOrderId, assignedToId });
		return fail(500, { error: 'Failed to assign work order' });
	}
}

/**
 * Update work order details (from detail page)
 */
export async function updateWorkOrderDetails(
	event: RequestEvent,
	prisma: RequestPrisma,
	workOrderId: string,
	data: {
		title: string;
		description?: string;
		assetId: string;
	}
) {
	const userId = event.locals.user!.id;

	try {
		// First fetch to check authorization
		const existing = await prisma.workOrder.findUnique({
			where: { id: workOrderId },
			select: { createdById: true, assignedToId: true }
		});

		if (!existing) {
			return fail(404, { error: 'Work order not found' });
		}

		// Check authorization
		assertCanUpdateWorkOrder(event, existing);

		const workOrder = await prisma.workOrder.update({
			where: { id: workOrderId },
			data: {
				title: data.title.trim(),
				description: data.description?.trim() || '',
				assetId: data.assetId
			},
			select: {
				id: true,
				title: true,
				description: true,
				assetId: true,
				organizationId: true
			}
		});

		broadcastToOrg(workOrder.organizationId, {
			type: 'WO_UPDATE',
			payload: workOrder
		});

		// Audit log
		await logAudit(userId, 'WORK_ORDER_UPDATED', {
			workOrderId: workOrder.id,
			title: workOrder.title
		});

		return { success: true, workOrder };
	} catch (e) {
		if (e && typeof e === 'object' && 'status' in e) {
			// Re-throw fail() responses
			throw e;
		}
		logError('Error updating work order', e, { workOrderId });
		return fail(500, { error: 'Failed to update work order' });
	}
}

/**
 * Delete a work order
 */
export async function deleteWorkOrder(
	event: RequestEvent,
	prisma: RequestPrisma,
	workOrderId: string
) {
	const userId = event.locals.user!.id;

	// Check authorization
	assertCanDeleteWorkOrder(event);

	try {
		// Get WO details before deletion for audit
		const wo = await prisma.workOrder.findUnique({
			where: { id: workOrderId },
			select: { title: true, organizationId: true }
		});

		if (!wo) {
			return fail(404, { error: 'Work order not found' });
		}

		await prisma.workOrder.delete({
			where: { id: workOrderId }
		});

		// Audit log
		await logAudit(userId, 'WORK_ORDER_DELETED', {
			workOrderId,
			title: wo.title
		});

		return { success: true, organizationId: wo.organizationId };
	} catch (e) {
		if (e && typeof e === 'object' && 'status' in e) {
			// Re-throw fail() responses
			throw e;
		}
		logError('Error deleting work order', e, { workOrderId });
		return fail(500, { error: 'Failed to delete work order' });
	}
}
