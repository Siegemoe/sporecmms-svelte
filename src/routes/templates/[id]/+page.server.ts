import type { Actions, PageServerLoad } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import { requireAuth } from '$lib/server/guards';
import { error, fail, redirect } from '@sveltejs/kit';
import { SecurityManager, SECURITY_RATE_LIMITS } from '$lib/server/security';
import {
	getTemplateById,
	updateTemplate,
	deleteTemplate
} from '$lib/server/work-orders/templates';
import { workOrderTemplateUpdateSchema } from '$lib/validation';

export const load: PageServerLoad = async (event) => {
	requireAuth(event);

	const prisma = await createRequestPrisma(event);
	const userId = event.locals.user!.id;
	const organizationId = event.locals.user!.organizationId;

	if (!organizationId) {
		throw error(400, 'Organization required');
	}

	const templateId = event.params.id;

	// Get template with access verification
	const template = await getTemplateById(prisma, templateId, organizationId, userId);

	if ('status' in template) {
		// Return error response
		if (template.status === 404) {
			throw error(404, 'Template not found');
		}
		if (template.status === 403) {
			throw error(403, 'You do not have access to this template');
		}
		throw error(500, 'Failed to load template');
	}

	// Get user role for permission checks
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { role: true }
	});

	return {
		template,
		userRole: user?.role || 'TECHNICIAN'
	};
};

export const actions: Actions = {
	/**
	 * Update template
	 */
	update: async (event) => {
		const security = SecurityManager.getInstance();
		const rateLimitResult = await security.checkRateLimit(
			{ event, action: 'template_update', userId: event.locals.user?.id },
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

		const templateId = event.params.id;
		const data = await event.request.formData();

		// Parse checklist items from FormData
		const itemsData = data.get('items') as string;
		let items: Array<{ title: string; id?: string }> = [];

		try {
			items = JSON.parse(itemsData);
		} catch {
			return fail(400, { error: 'Invalid checklist items format.' });
		}

		// Build update data
		const updateData: Record<string, unknown> = {};

		const name = data.get('name');
		const description = data.get('description');
		const title = data.get('title');
		const workDescription = data.get('workDescription');
		const priority = data.get('priority');

		if (name !== null) updateData.name = name;
		if (description !== null) updateData.description = description;
		if (title !== null) updateData.title = title;
		if (workDescription !== null) updateData.workDescription = workDescription;
		if (priority !== null) updateData.priority = priority;
		if (items.length > 0) updateData.items = items;

		// Validate with Zod
		const validationResult = workOrderTemplateUpdateSchema.safeParse(updateData);

		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			return fail(400, { error: firstError?.message || 'Validation failed.' });
		}

		return updateTemplate(
			event,
			prisma,
			templateId,
			validationResult.data,
			userId,
			organizationId
		);
	},

	/**
	 * Delete template
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

		const templateId = event.params.id;

		const result = await deleteTemplate(event, prisma, templateId, userId, organizationId);

		if ('success' in result) {
			throw redirect(303, '/templates');
		}

		return result;
	}
};
