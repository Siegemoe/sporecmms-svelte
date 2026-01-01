import type { Actions, PageServerLoad } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import { requireAuth } from '$lib/server/guards';
import { error, fail } from '@sveltejs/kit';
import type { Priority } from '@prisma/client';
import { PRIORITIES, DEFAULT_PRIORITY } from '$lib/constants';
import { SecurityManager, SECURITY_RATE_LIMITS } from '$lib/server/security';
import {
	queryTemplates,
	createTemplate,
	deleteTemplate
} from '$lib/server/work-orders/templates';
import { workOrderTemplateSchema } from '$lib/validation';

export const load: PageServerLoad = async (event) => {
	requireAuth(event);

	const prisma = await createRequestPrisma(event);
	const userId = event.locals.user!.id;
	const organizationId = event.locals.user!.organizationId;

	if (!organizationId) {
		throw error(400, 'Organization required');
	}

	// Parse Query Params
	const search = event.url.searchParams.get('search');
	const showInactive = event.url.searchParams.get('inactive') === 'true';

	// Query templates
	const templates = await queryTemplates(prisma, {
		organizationId,
		isActive: showInactive ? undefined : true,
		search: search || undefined
	});

	return {
		templates,
		search,
		showInactive
	};
};

export const actions: Actions = {
	/**
	 * Create a new template
	 */
	create: async (event) => {
		const security = SecurityManager.getInstance();
		const rateLimitResult = await security.checkRateLimit(
			{ event, action: 'template_create', userId: event.locals.user?.id },
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

		if (!userId || !organizationId) {
			return fail(401, { error: 'Authentication required.' });
		}

		const data = await event.request.formData();

		// Parse checklist items from FormData
		const itemsData = data.get('items') as string;
		let items: Array<{ title: string }> = [];

		try {
			items = JSON.parse(itemsData);
			if (!Array.isArray(items) || items.length === 0) {
				return fail(400, { error: 'At least one checklist item is required.' });
			}
		} catch {
			return fail(400, { error: 'Invalid checklist items format.' });
		}

		// Validate with Zod
		const validationResult = workOrderTemplateSchema.safeParse({
			name: data.get('name'),
			description: data.get('description') || undefined,
			title: data.get('title') || undefined,
			workDescription: data.get('workDescription') || undefined,
			priority: data.get('priority') || DEFAULT_PRIORITY,
			isGlobal: data.get('isGlobal') === 'true',
			items
		});

		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			return fail(400, { error: firstError?.message || 'Validation failed.' });
		}

		return createTemplate(event, prisma, validationResult.data, userId, organizationId);
	},

	/**
	 * Delete (soft delete) a template
	 */
	delete: async (event) => {
		const security = SecurityManager.getInstance();
		const rateLimitResult = await security.checkRateLimit(
			{ event, action: 'template_delete', userId: event.locals.user?.id },
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

		if (!userId || !organizationId) {
			return fail(401, { error: 'Authentication required.' });
		}

		const data = await event.request.formData();
		const templateId = data.get('templateId') as string;

		if (!templateId) {
			return fail(400, { error: 'Template ID is required.' });
		}

		return deleteTemplate(event, prisma, templateId, userId, organizationId);
	}
};
