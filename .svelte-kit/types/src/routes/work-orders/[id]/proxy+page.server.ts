// @ts-nocheck
import type { PageServerLoad, Actions } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import { fail, error, redirect } from '@sveltejs/kit';
import type { WorkOrderStatus } from '@prisma/client';
import { requireAuth } from '$lib/server/guards';
import { formatUserName } from '$lib/utils/user';
import { logError } from '$lib/server/logger';
import { SecurityManager, SECURITY_RATE_LIMITS } from '$lib/server/security';
import { validateInput, workOrderCommentSchema, workOrderChecklistSchema } from '$lib/validation';
import { STATUSES_REQUIRING_REASON } from '$lib/constants';
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
import {
	queryChecklistItems,
	createChecklistItem,
	toggleChecklistItem,
	deleteChecklistItem
} from '$lib/server/work-orders/checklist';

export const load = async (event: Parameters<PageServerLoad>[0]) => {
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

	// Get checklist items
	const checklistItems = await queryChecklistItems(prisma, id);

	// Get mentionable users for @mention dropdown
	const organizationId = event.locals.user!.organizationId;
	if (!organizationId) {
		throw error(400, 'User must belong to an organization');
	}
	const mentionableUsers = await queryMentionableUsers(prisma, organizationId);

	// Format users with their @mention username
	const mentionableUsersWithUsername = mentionableUsers.map((u: any) => ({
		...u,
		displayName: formatUserName(u),
		mentionUsername: formatMentionUsername(u)
	}));

	return {
		workOrder,
		assets,
		comments,
		statusHistory: formatStatusHistory(statusHistory),
		mentionableUsers: mentionableUsersWithUsername,
		checklistItems
	};
};

export const actions = {
	updateStatus: async (event: import('./$types').RequestEvent) => {
		const security = SecurityManager.getInstance();
		const rateLimitResult = await security.checkRateLimit(
			{ event, action: 'work_order_status_update', userId: event.locals.user?.id },
			SECURITY_RATE_LIMITS.FORM
		);

		if (!rateLimitResult.success) {
			if (rateLimitResult.blocked) {
				return fail(429, { error: 'Too many requests. Your IP has been temporarily blocked.' });
			}
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}

		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		const { id } = event.params;

		const newStatus = formData.get('status') as WorkOrderStatus;
		const reason = formData.get('reason') as string | undefined;

		if (!newStatus) {
			return fail(400, { error: 'Status is required' });
		}

		// Validate reason requirement for certain statuses
		if (STATUSES_REQUIRING_REASON.includes(newStatus as any) && !reason?.trim()) {
			return fail(400, { error: 'A reason is required for this status change.' });
		}

		return updateWorkOrderStatus(event, prisma, id, newStatus, reason?.trim());
	},

	update: async (event: import('./$types').RequestEvent) => {
		const security = SecurityManager.getInstance();
		const rateLimitResult = await security.checkRateLimit(
			{ event, action: 'work_order_update', userId: event.locals.user?.id },
			SECURITY_RATE_LIMITS.FORM
		);

		if (!rateLimitResult.success) {
			if (rateLimitResult.blocked) {
				return fail(429, { error: 'Too many requests. Your IP has been temporarily blocked.' });
			}
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}

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

	delete: async (event: import('./$types').RequestEvent) => {
		const security = SecurityManager.getInstance();
		const rateLimitResult = await security.checkRateLimit(
			{ event, action: 'work_order_delete', userId: event.locals.user?.id },
			SECURITY_RATE_LIMITS.FORM
		);

		if (!rateLimitResult.success) {
			if (rateLimitResult.blocked) {
				return fail(429, { error: 'Too many requests. Your IP has been temporarily blocked.' });
			}
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}

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
	addComment: async (event: import('./$types').RequestEvent) => {
		const security = SecurityManager.getInstance();
		const rateLimitResult = await security.checkRateLimit(
			{ event, action: 'work_order_comment_add', userId: event.locals.user?.id },
			SECURITY_RATE_LIMITS.FORM
		);

		if (!rateLimitResult.success) {
			if (rateLimitResult.blocked) {
				return fail(429, { error: 'Too many requests. Your IP has been temporarily blocked.' });
			}
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}

		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		const { id } = event.params;

		// Validate with Zod
		const validation = validateInput(workOrderCommentSchema, {
			content: formData.get('content'),
			parentId: formData.get('parentId')
		});

		if (!validation.success) {
			const firstError = Object.values(validation.errors)[0];
			return fail(400, { error: firstError });
		}

		return createComment(event, prisma, {
			workOrderId: id,
			content: validation.data.content,
			userId: event.locals.user!.id,
			parentId: validation.data.parentId
		});
	},

	/**
	 * Update an existing comment
	 */
	updateComment: async (event: import('./$types').RequestEvent) => {
		const security = SecurityManager.getInstance();
		const rateLimitResult = await security.checkRateLimit(
			{ event, action: 'work_order_comment_update', userId: event.locals.user?.id },
			SECURITY_RATE_LIMITS.FORM
		);

		if (!rateLimitResult.success) {
			if (rateLimitResult.blocked) {
				return fail(429, { error: 'Too many requests. Your IP has been temporarily blocked.' });
			}
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}

		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();

		const commentId = formData.get('commentId') as string;

		if (!commentId) {
			return fail(400, { error: 'Comment ID is required.' });
		}

		// Validate content with Zod
		const validation = validateInput(workOrderCommentSchema, {
			content: formData.get('content'),
			parentId: undefined // Not used for updates
		});

		if (!validation.success) {
			const firstError = Object.values(validation.errors)[0];
			return fail(400, { error: firstError });
		}

		return updateCommentService(event, prisma, commentId, event.locals.user!.id, validation.data.content);
	},

	/**
	 * Delete a comment
	 */
	deleteComment: async (event: import('./$types').RequestEvent) => {
		const security = SecurityManager.getInstance();
		const rateLimitResult = await security.checkRateLimit(
			{ event, action: 'work_order_comment_delete', userId: event.locals.user?.id },
			SECURITY_RATE_LIMITS.FORM
		);

		if (!rateLimitResult.success) {
			if (rateLimitResult.blocked) {
				return fail(429, { error: 'Too many requests. Your IP has been temporarily blocked.' });
			}
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}

		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();

		const commentId = formData.get('commentId') as string;

		if (!commentId) {
			return fail(400, { error: 'Comment ID is required.' });
		}

		return deleteCommentService(event, prisma, commentId, event.locals.user!.id);
	},

	/**
	 * Add a checklist item
	 */
	addChecklistItem: async (event: import('./$types').RequestEvent) => {
		const security = SecurityManager.getInstance();
		const rateLimitResult = await security.checkRateLimit(
			{ event, action: 'work_order_checklist_add', userId: event.locals.user?.id },
			SECURITY_RATE_LIMITS.FORM
		);

		if (!rateLimitResult.success) {
			if (rateLimitResult.blocked) {
				return fail(429, { error: 'Too many requests. Your IP has been temporarily blocked.' });
			}
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}

		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		const { id } = event.params;

		// Validate with Zod
		const validation = validateInput(workOrderChecklistSchema, {
			title: formData.get('title')
		});

		if (!validation.success) {
			const firstError = Object.values(validation.errors)[0];
			return fail(400, { error: firstError });
		}

		const userId = event.locals.user!.id;
		const organizationId = event.locals.user!.organizationId;

		return createChecklistItem(prisma, id, validation.data.title, userId, organizationId);
	},

	/**
	 * Toggle checklist item completion
	 */
	toggleChecklistItem: async (event: import('./$types').RequestEvent) => {
		const security = SecurityManager.getInstance();
		const rateLimitResult = await security.checkRateLimit(
			{ event, action: 'work_order_checklist_toggle', userId: event.locals.user?.id },
			SECURITY_RATE_LIMITS.FORM
		);

		if (!rateLimitResult.success) {
			if (rateLimitResult.blocked) {
				return fail(429, { error: 'Too many requests. Your IP has been temporarily blocked.' });
			}
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}

		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();

		const itemId = formData.get('itemId') as string;
		const isCompleted = formData.get('isCompleted') === 'true';
		const userId = event.locals.user!.id;
		const organizationId = event.locals.user!.organizationId;

		if (!itemId) {
			return fail(400, { error: 'Item ID is required.' });
		}

		return toggleChecklistItem(prisma, itemId, isCompleted, userId, organizationId);
	},

	/**
	 * Delete a checklist item
	 */
	deleteChecklistItem: async (event: import('./$types').RequestEvent) => {
		const security = SecurityManager.getInstance();
		const rateLimitResult = await security.checkRateLimit(
			{ event, action: 'work_order_checklist_delete', userId: event.locals.user?.id },
			SECURITY_RATE_LIMITS.FORM
		);

		if (!rateLimitResult.success) {
			if (rateLimitResult.blocked) {
				return fail(429, { error: 'Too many requests. Your IP has been temporarily blocked.' });
			}
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}

		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();

		const itemId = formData.get('itemId') as string;
		const userId = event.locals.user!.id;
		const organizationId = event.locals.user!.organizationId;

		if (!itemId) {
			return fail(400, { error: 'Item ID is required.' });
		}

		return deleteChecklistItem(prisma, itemId, userId, organizationId);
	}
};
;null as any as Actions;