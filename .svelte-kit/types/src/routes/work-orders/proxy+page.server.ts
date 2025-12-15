// @ts-nocheck
import type { Actions, PageServerLoad } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import { broadcastToOrg } from '$lib/server/websocket-handler';
import { WorkOrderStatus } from '@prisma/client';
import { requireAuth, isManagerOrAbove } from '$lib/server/guards';
import { fail } from '@sveltejs/kit';
import { logAudit } from '$lib/server/audit';

export const load = async (event: Parameters<PageServerLoad>[0]) => {
	requireAuth(event);
	
	const prisma = await createRequestPrisma(event);
	const myOnly = event.url.searchParams.get('my') === 'true';
	const userId = event.locals.user!.id;
	
	const workOrders = await prisma.workOrder.findMany({
		where: myOnly ? { assignedToId: userId } : undefined,
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
			room: {
				select: {
					id: true,
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
			assignedTo: {
				select: {
					id: true,
					firstName: true,
					lastName: true
				}
			}
		},
		orderBy: {
			createdAt: 'desc'
		}
	});

	// Get assets for the create form
	const assets = await prisma.asset.findMany({
		include: {
			room: {
				include: {
					site: { select: { name: true } }
				}
			}
		},
		orderBy: { name: 'asc' }
	});

	// Get users for assignment dropdown
	const users = await prisma.user.findMany({
		where: { orgId: event.locals.user!.orgId },
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true
		},
		orderBy: { firstName: 'asc' }
	});

	return { workOrders, assets, users, myOnly };
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
		const failureMode = data.get('failureMode') as string || 'General';
		const selectionMode = data.get('selectionMode') as string || 'asset';

		// Selection inputs
		const assetId = data.get('assetId') as string;
		const roomId = data.get('roomId') as string;
		const buildingId = data.get('buildingId') as string;

		if (!title) {
			return { success: false, error: 'Title is required.' };
		}

		// Validate at least one selection is made
		if (!assetId && !roomId && !buildingId) {
			return { success: false, error: 'Please select an asset, room, or building.' };
		}

		try {
			const orgId = event.locals.user!.orgId;

			// Create work order with appropriate relationships
			const newWo = await prisma.workOrder.create({
				data: {
					title: title.trim(),
					description: description?.trim() || '',
					failureMode,
					orgId,
					status: 'PENDING',
					// Only set the relevant ID based on selection mode
					...(selectionMode === 'asset' && { assetId }),
					...(selectionMode === 'room' && { roomId }),
					...(selectionMode === 'building' && { buildingId })
				},
				select: {
					id: true,
					title: true,
					status: true,
					assetId: true,
					buildingId: true,
					roomId: true,
					orgId: true,
					createdAt: true
				}
			});

			// Broadcast to all connected clients
			broadcastToOrg(orgId, {
				type: 'WO_NEW',
				payload: newWo
			});

			// Audit log
			await logAudit(event.locals.user!.id, 'WORK_ORDER_CREATED', {
				workOrderId: newWo.id,
				title: newWo.title,
				selectionMode,
				selectionDetails: selectionMode === 'asset' ? { assetId } :
					selectionMode === 'room' ? { roomId } :
					selectionMode === 'building' ? { buildingId } :
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
			//    Middleware automatically filters by the user's orgId.
			const updatedWo = await prisma.workOrder.update({
				where: { id: woId },
				data: { status: newStatus },
				// Select specific fields for the broadcast payload
				select: {
					id: true,
					title: true,
					status: true,
					assetId: true,
					orgId: true
				}
			});

			if (!updatedWo) {
				return { success: false, error: 'Work order not found.' };
			}

			// 2. REAL-TIME BROADCAST: Push the change instantly to all connected clients in the same organization.
			broadcastToOrg(updatedWo.orgId, {
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
					orgId: true,
					assignedTo: {
						select: { firstName: true, lastName: true }
					}
				}
			});

			broadcastToOrg(updatedWo.orgId, {
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