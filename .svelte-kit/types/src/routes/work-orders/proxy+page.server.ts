// @ts-nocheck
import type { Actions, PageServerLoad } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import { requireAuth } from '$lib/server/guards';
import { error, fail } from '@sveltejs/kit';
import type { WorkOrderStatus, Priority } from '@prisma/client';
import { DEFAULT_PRIORITY, DEFAULT_SELECTION_MODE, PRIORITIES } from '$lib/constants';
import { MAX_DESCRIPTION_LENGTH } from '$lib/constants/limits';
import { SecurityManager, SECURITY_RATE_LIMITS } from '$lib/server/security';
import {
	queryWorkOrders,
	queryLocationOptions,
	createWorkOrder,
	updateWorkOrderStatus,
	assignWorkOrder
} from '$lib/server/work-orders/service';
import { queryTemplates, applyTemplate } from '$lib/server/work-orders/templates';
import type { WorkOrderCreateInput } from '$lib/validation';

export const load = async (event: Parameters<PageServerLoad>[0]) => {
	requireAuth(event);

	const prisma = await createRequestPrisma(event);
	const userId = event.locals.user!.id;
	const organizationId = event.locals.user!.organizationId;

	if (!organizationId) {
		throw error(400, 'Organization required');
	}

	// Parse Query Params
	const myOnly = event.url.searchParams.get('my') === 'true';
	const status = event.url.searchParams.get('status') as WorkOrderStatus | null;
	const priority = event.url.searchParams.get('priority') as Priority | null;
	const siteId = event.url.searchParams.get('siteId');
	const sort = event.url.searchParams.get('sort') || 'dueDate';
	const search = event.url.searchParams.get('search');

	// Query work orders with filters
	const workOrders = await queryWorkOrders(prisma, {
		organizationId,
		assignedToId: myOnly ? userId : undefined,
		status: status || undefined,
		priority: priority || undefined,
		siteId: siteId || undefined,
		sort,
		search: search || undefined
	});

	// Get location options for the create form
	const locationOptions = await queryLocationOptions(prisma, organizationId);

	// Get active templates for the organization
	const templates = await queryTemplates(prisma, {
		organizationId,
		isActive: true
	});

	return {
		workOrders,
		...locationOptions,
		templates,
		myOnly,
		status,
		priority,
		siteId,
		sort,
		search
	};
};

export const actions = {
	/**
	 * Create a new Work Order
	 */
	create: async (event: import('./$types').RequestEvent) => {
		const security = SecurityManager.getInstance();
		const rateLimitResult = await security.checkRateLimit(
			{ event, action: 'work_order_create', userId: event.locals.user?.id },
			SECURITY_RATE_LIMITS.FORM
		);

		if (!rateLimitResult.success) {
			if (rateLimitResult.blocked) {
				return fail(429, { error: 'Too many requests. Your IP has been temporarily blocked.' });
			}
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}

		const prisma = await createRequestPrisma(event);
		const userId = event.locals.user?.id;
		const organizationId = event.locals.user?.organizationId;
		const data = await event.request.formData();

		let title = data.get('title') as string;
		let description = data.get('description') as string;
		let priority = (data.get('priority') as string) || DEFAULT_PRIORITY;
		const dueDate = data.get('dueDate') as string;
		const assignedToId = data.get('assignedToId') as string;
		const selectionMode = (data.get('selectionMode') as string) || DEFAULT_SELECTION_MODE;

		// Selection inputs
		const assetId = data.get('assetId') as string;
		const unitId = (data.get('unitId') || data.get('roomId')) as string;
		const buildingId = data.get('buildingId') as string;
		const siteId = data.get('siteId') as string;

		// Template handling
		const templateId = data.get('templateId') as string;
		let checklistItems: Array<{ title: string }> = [];

		// Apply template if selected
		if (templateId && organizationId) {
			const templateResult = await applyTemplate(prisma, templateId, organizationId);

			if ('status' in templateResult) {
				// Template error - return the error
				return templateResult;
			}

			// Use template values as defaults if form fields are empty
			if (!title?.trim() && templateResult.title) {
				title = templateResult.title;
			}
			if (!description?.trim() && templateResult.description) {
				description = templateResult.description;
			}
			// Only override priority if not explicitly set
			if (priority === DEFAULT_PRIORITY && templateResult.priority) {
				priority = templateResult.priority;
			}
			checklistItems = templateResult.items || [];
		}

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
		if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
			return fail(400, { error: `Description is too long (max ${MAX_DESCRIPTION_LENGTH} characters).` });
		}

		// Validate dueDate format if provided
		let parsedDueDate: Date | null = null;
		if (dueDate) {
			parsedDueDate = new Date(dueDate);
			if (isNaN(parsedDueDate.getTime())) {
				return fail(400, { error: 'Invalid due date format.' });
			}
		}

		// Validate at least one selection is made
		if (!assetId && !unitId && !buildingId && !siteId) {
			return fail(400, { error: 'Please select an asset, unit, building, or site.' });
		}

		return createWorkOrder(event, prisma, {
			title,
			description: trimmedDescription,
			priority: priority as Priority,
			dueDate: parsedDueDate,
			assignedToId: assignedToId || undefined,
			selectionMode: (selectionMode || 'asset') as 'asset' | 'unit' | 'building' | 'site',
			assetId,
			unitId,
			buildingId,
			siteId,
			checklistItems
		});
	},

	/**
	 * Handles updating the status of a Work Order.
	 * This is the core workflow trigger for the real-time system.
	 */
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
		const data = await event.request.formData();
		const woId = data.get('workOrderId') as string;
		const newStatus = data.get('status') as WorkOrderStatus;

		if (!woId || !newStatus) {
			return { success: false, error: 'Missing ID or status.' };
		}

		return updateWorkOrderStatus(event, prisma, woId, newStatus);
	},

	assign: async (event: import('./$types').RequestEvent) => {
		const security = SecurityManager.getInstance();
		const rateLimitResult = await security.checkRateLimit(
			{ event, action: 'work_order_assign', userId: event.locals.user?.id },
			SECURITY_RATE_LIMITS.FORM
		);

		if (!rateLimitResult.success) {
			if (rateLimitResult.blocked) {
				return fail(429, { error: 'Too many requests. Your IP has been temporarily blocked.' });
			}
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}

		const prisma = await createRequestPrisma(event);
		const data = await event.request.formData();

		const woId = data.get('workOrderId') as string;
		const assignedToId = data.get('assignedToId') as string;

		if (!woId) {
			return fail(400, { error: 'Work order ID required' });
		}

		return assignWorkOrder(event, prisma, woId, assignedToId || null);
	}
};
;null as any as Actions;