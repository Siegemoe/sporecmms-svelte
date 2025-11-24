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
	
	const prisma = createRequestPrisma(event);
	const { id } = event.params;

	const workOrder = await prisma.workOrder.findUnique({
		where: { id },
		include: {
			asset: {
				include: {
					room: {
						include: {
							site: { select: { id: true, name: true } }
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
		include: {
			room: {
				include: {
					site: { select: { name: true } }
				}
			}
		},
		orderBy: { name: 'asc' }
	});

	return { workOrder, assets };
};

export const actions = {
	updateStatus: async (event: import('./$types').RequestEvent) => {
		const prisma = createRequestPrisma(event);
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
				orgId: true
			}
		});

		broadcastToOrg(updatedWo.orgId, {
			type: 'WO_UPDATE',
			payload: updatedWo
		});

		return { success: true, workOrder: updatedWo };
	},

	update: async (event: import('./$types').RequestEvent) => {
		const prisma = createRequestPrisma(event);
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
				failureMode: failureMode || 'General'
			}
		});

		return { success: true, workOrder };
	},

	delete: async (event: import('./$types').RequestEvent) => {
		// Only Admin/Manager can delete work orders
		if (!isManagerOrAbove(event)) {
			return fail(403, { error: 'Permission denied. Only managers can delete work orders.' });
		}
		
		const prisma = createRequestPrisma(event);
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