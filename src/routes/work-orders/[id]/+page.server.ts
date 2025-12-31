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
import {
	queryComments,
	createComment,
	updateComment as updateCommentService,
	deleteComment as deleteCommentService
} from '$lib/server/work-orders/comments';
import { queryStatusHistory, formatStatusHistory } from '$lib/server/work-orders/status-history';
import { queryMentionableUsers, formatMentionUsername } from '$lib/server/work-orders/mentions';

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

	// Get comments for this work order
	const comments = await queryComments(prisma, id);

	// Get status history
	const statusHistory = await queryStatusHistory(prisma, id);

	// Get mentionable users for @mention dropdown
	const organizationId = event.locals.user!.organizationId;
	if (!organizationId) {
		throw error(400, 'User must belong to an organization');
	}
	const mentionableUsers = await queryMentionableUsers(prisma, organizationId);

	// Format users with their @mention username
	const mentionableUsersWithUsername = mentionableUsers.map((u: any) => ({
		...u,
		displayName: u.firstName
			? [u.firstName, u.lastName].filter(Boolean).join(' ')
			: u.email,
		mentionUsername: formatMentionUsername(u)
	}));

	return {
		workOrder,
		assets,
		comments,
		statusHistory: formatStatusHistory(statusHistory),
		mentionableUsers: mentionableUsersWithUsername
	};
};

export const actions: Actions = {
	updateStatus: async (event) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		const { id } = event.params;

		const newStatus = formData.get('status') as WorkOrderStatus;
		const reason = formData.get('reason') as string | undefined;

		if (!newStatus) {
			return fail(400, { error: 'Status is required' });
		}

		// Validate reason requirement for certain statuses
		const statusesRequiringReason = ['ON_HOLD', 'COMPLETED', 'CANCELLED'];
		if (statusesRequiringReason.includes(newStatus) && !reason?.trim()) {
			return fail(400, { error: 'A reason is required for this status change.' });
		}

		return updateWorkOrderStatus(event, prisma, id, newStatus, reason?.trim());
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
	},

	/**
	 * Add a new comment
	 */
	addComment: async (event) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		const { id } = event.params;

		const content = formData.get('content') as string;
		const parentId = formData.get('parentId') as string | undefined;

		return createComment(event, prisma, {
			workOrderId: id,
			content,
			userId: event.locals.user!.id,
			parentId
		});
	},

	/**
	 * Update an existing comment
	 */
	updateComment: async (event) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();

		const commentId = formData.get('commentId') as string;
		const content = formData.get('content') as string;

		if (!commentId) {
			return fail(400, { error: 'Comment ID is required.' });
		}

		return updateCommentService(event, prisma, commentId, event.locals.user!.id, content);
	},

	/**
	 * Delete a comment
	 */
	deleteComment: async (event) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();

		const commentId = formData.get('commentId') as string;

		if (!commentId) {
			return fail(400, { error: 'Comment ID is required.' });
		}

		return deleteCommentService(event, prisma, commentId, event.locals.user!.id);
	}
};
