import type { PageServerLoad, Actions } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import { fail, error, redirect } from '@sveltejs/kit';
import type { WorkOrderStatus } from '@prisma/client';
import { requireAuth } from '$lib/server/guards';
import {
	queryWorkOrderById,
	queryAssetsForDropdown,
	updateWorkOrderStatus,
	updateWorkOrderDetails,
	deleteWorkOrder
} from '$lib/server/work-orders/service';

export const load: PageServerLoad = async (event) => {
	requireAuth(event);

	const prisma = await createRequestPrisma(event);
	const { id } = event.params;

	const workOrder = await queryWorkOrderById(prisma, id);

	if (!workOrder) {
		throw error(404, 'Work order not found');
	}

	// Get all assets for edit dropdown
	const assets = await queryAssetsForDropdown(prisma, event.locals.user!.organizationId);

	return { workOrder, assets };
};

export const actions: Actions = {
	updateStatus: async (event) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		const { id } = event.params;

		const newStatus = formData.get('status') as WorkOrderStatus;

		if (!newStatus) {
			return fail(400, { error: 'Status is required' });
		}

		return updateWorkOrderStatus(event, prisma, id, newStatus);
	},

	update: async (event) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		const { id } = event.params;

		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const assetId = formData.get('assetId') as string;

		if (!title || title.trim() === '') {
			return fail(400, { error: 'Title is required' });
		}

		if (!assetId) {
			return fail(400, { error: 'Asset is required' });
		}

		return updateWorkOrderDetails(event, prisma, id, {
			title,
			description,
			assetId
		});
	},

	delete: async (event) => {
		const prisma = await createRequestPrisma(event);
		const { id } = event.params;

		const result = await deleteWorkOrder(event, prisma, id);

		// Check if the result indicates success
		if (typeof result === 'object' && result !== null && 'success' in result && result.success === true) {
			// Redirect after successful delete
			throw redirect(303, '/work-orders');
		}

		// Return error if delete failed
		return result;
	}
};
