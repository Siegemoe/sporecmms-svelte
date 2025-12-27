// @ts-nocheck
import type { PageServerLoad, Actions } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import { broadcastToOrg } from '$lib/server/websocket-handler';
import { fail, error, redirect } from '@sveltejs/kit';
import { WorkOrderStatus } from '@prisma/client';
import { requireAuth, isManagerOrAbove } from '$lib/server/guards';
import { logAudit } from '$lib/server/audit';

export const load = async (event: Parameters<PageServerLoad>[0]) => {
	requireAuth(event);
	
	const prisma = await createRequestPrisma(event);
	const { id } = event.params;

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
		throw error(404, 'Work order not found');
	}

	// Get all assets for edit dropdown
	const assets = await prisma.asset.findMany({
		where: {
			Unit: {
				Site: {
					organizationId: event.locals.user!.organizationId ?? undefined
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

	// Map unit to room for frontend compatibility
	// Since we throw a 404 if workOrder is not found, workOrderWithRoom will never be null
	const workOrderWithRoom = {
		...workOrder,
		asset: workOrder.Asset ? {
			...workOrder.Asset,
			room: workOrder.Asset.Unit ? {
				...workOrder.Asset.Unit,
				name: workOrder.Asset.Unit.name || workOrder.Asset.Unit.roomNumber,
				building: workOrder.Asset.Unit.Building,
				site: workOrder.Asset.Unit.Site
			} : null
		} : null
	};

	const assetsWithRoom = assets.map(asset => ({
		...asset,
		room: asset.Unit ? {
			...asset.Unit,
			name: asset.Unit.name || asset.Unit.roomNumber,
			site: asset.Unit.Site,
			building: asset.Unit.Building
		} : null
	}));

	return { workOrder: workOrderWithRoom, assets: assetsWithRoom };
};

export const actions = {
	updateStatus: async (event: import('./$types').RequestEvent) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		const { id } = event.params;
		
		const newStatus = formData.get('status') as WorkOrderStatus;
		
		if (!newStatus) {
			return fail(400, { error: 'Status is required' });
		}

		const updatedWo = await prisma.workOrder.update({
			where: { id },
			data: { status: newStatus },
			select: {
				id: true,
				title: true,
				status: true,
				assetId: true,
				organizationId: true
			}
		});

		broadcastToOrg(updatedWo.organizationId, {
			type: 'WO_UPDATE',
			payload: updatedWo
		});

		return { success: true, workOrder: updatedWo };
	},

	update: async (event: import('./$types').RequestEvent) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		const { id } = event.params;
		
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const assetId = formData.get('assetId') as string;
		const failureMode = formData.get('failureMode') as string;
		
		if (!title || title.trim() === '') {
			return fail(400, { error: 'Title is required' });
		}
		
		if (!assetId) {
			return fail(400, { error: 'Asset is required' });
		}

		const workOrder = await prisma.workOrder.update({
			where: { id },
			data: {
				title: title.trim(),
				description: description?.trim() || '',
				assetId,
				// failureMode: failureMode || 'General' // Removed: Field does not exist in WorkOrder schema
			}
		});

		return { success: true, workOrder };
	},

	delete: async (event: import('./$types').RequestEvent) => {
		// Only Admin/Manager can delete work orders
		if (!isManagerOrAbove(event)) {
			return fail(403, { error: 'Permission denied. Only managers can delete work orders.' });
		}
		
		const prisma = await createRequestPrisma(event);
		const { id } = event.params;

		// Get WO details before deletion for audit
		const wo = await prisma.workOrder.findUnique({
			where: { id },
			select: { title: true }
		});

		await prisma.workOrder.delete({
			where: { id }
		});

		// Audit log
		await logAudit(event.locals.user!.id, 'WORK_ORDER_DELETED', {
			workOrderId: id,
			title: wo?.title
		});

		throw redirect(303, '/work-orders');
	}
};
;null as any as Actions;