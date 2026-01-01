import type { RequestEvent } from '@sveltejs/kit';
import type { RequestPrisma } from '$lib/types/prisma';
import type { Priority } from '@prisma/client';
import { fail } from '@sveltejs/kit';
import { logError } from '$lib/server/logger';
import { logAudit } from '$lib/server/audit';
import { SecurityManager } from '$lib/server/security';

/**
 * Type for enriched template with item count
 */
export interface EnrichedTemplate {
	id: string;
	name: string;
	description: string | null;
	title: string | null;
	workDescription: string | null;
	priority: Priority;
	isGlobal: boolean;
	organizationId: string | null;
	isActive: boolean;
	usageCount: number;
	createdAt: Date;
	updatedAt: Date;
	createdBy: string;
	_itemCount?: number;
	TemplateItems?: Array<{ id: string; title: string; position: number }>;
}

/**
 * Query templates with filtering
 * - Returns org templates + global templates
 * - Filters by isActive, search
 */
export async function queryTemplates(
	prisma: RequestPrisma,
	filters: {
		organizationId: string;
		isActive?: boolean;
		search?: string;
	}
): Promise<EnrichedTemplate[]> {
	const { organizationId, isActive, search } = filters;

	// Build where clause for templates
	const where: {
		OR?: Array<{ organizationId: string } | { isGlobal: boolean }>;
		isActive?: boolean;
		name?: { contains: string; mode: 'insensitive' };
	} = {
		OR: [
			{ organizationId },
			{ isGlobal: true }
		]
	};

	if (isActive !== undefined) {
		where.isActive = isActive;
	}

	if (search) {
		where.name = { contains: search, mode: 'insensitive' };
	}

	const templates = await prisma.workOrderTemplate.findMany({
		where,
		orderBy: { name: 'asc' },
		include: {
			Organization: {
				select: { id: true, name: true }
			},
			Creator: {
				select: { id: true, firstName: true, lastName: true, email: true }
			}
		}
	});

	// Count items for each template
	const templateIds = templates.map((t) => t.id);
	const itemCounts = await prisma.workOrderTemplateItem.groupBy({
		by: ['templateId'],
		where: { templateId: { in: templateIds } },
		_count: { _all: true }
	});

	const itemCountMap = new Map(
		itemCounts.map((item) => [item.templateId, item._count._all])
	);

	return templates.map((template) => ({
		...template,
		_itemCount: itemCountMap.get(template.id) || 0
	}));
}

/**
 * Get template by ID with items
 * - Verifies access (org match or global)
 * - Logs security events for access denials
 */
export async function getTemplateById(
	prisma: RequestPrisma,
	templateId: string,
	organizationId: string,
	userId?: string
): Promise<
	| EnrichedTemplate & { TemplateItems: Array<{ id: string; title: string; position: number }> }
	| ReturnType<typeof fail>
> {
	let template;
	try {
		template = await prisma.workOrderTemplate.findUnique({
			where: { id: templateId },
			include: {
				TemplateItems: {
					orderBy: { position: 'asc' }
				}
			}
		});
	} catch (e) {
		logError('Failed to fetch template', e, { templateId, userId });
		return fail(500, { error: 'Failed to fetch template. Please try again.' });
	}

	if (!template) {
		return fail(404, { error: 'Template not found.' });
	}

	// Verify access
	if (!template.isGlobal && template.organizationId !== organizationId) {
		if (userId) {
			const security = SecurityManager.getInstance();
			await security.logSecurityEvent({
				event: undefined,
				action: 'TEMPLATE_ACCESS_DENIED',
				details: { templateId, reason: 'Organization mismatch' },
				severity: 'WARNING',
				userId
			});
		}
		return fail(403, { error: 'You do not have access to this template.' });
	}

	if (!template.isActive) {
		return fail(404, { error: 'Template not found.' });
	}

	return template as EnrichedTemplate & { TemplateItems: typeof template.TemplateItems };
}

/**
 * Create a new template
 * - Only managers/admins can create org templates
 * - Transaction to create template + items
 * - Logs audit event
 */
export async function createTemplate(
	event: RequestEvent,
	prisma: RequestPrisma,
	data: {
		name: string;
		description?: string;
		title?: string;
		workDescription?: string;
		priority?: Priority;
		isGlobal?: boolean;
		items: Array<{ title: string }>;
	},
	userId: string,
	organizationId: string
) {
	const { name, description, title, workDescription, priority, isGlobal = false, items } = data;

	// Check permissions for global templates
	if (isGlobal) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { role: true }
		});

		if (!user || user.role !== 'ADMIN') {
			return fail(403, { error: 'Only administrators can create global templates.' });
		}
	}

	// Validate at least one checklist item
	if (!items || items.length === 0) {
		return fail(400, { error: 'At least one checklist item is required.' });
	}

	try {
		// Create template and items in a transaction
		const template = await prisma.$transaction(async (tx) => {
			// Create template
			const newTemplate = await tx.workOrderTemplate.create({
				data: {
					name: name.trim(),
					description: description?.trim() || null,
					title: title?.trim() || null,
					workDescription: workDescription?.trim() || null,
					priority: priority || 'MEDIUM',
					isGlobal,
					organizationId: isGlobal ? null : organizationId,
					createdBy: userId
				}
			});

			// Create checklist items
			const templateItems = items.map((item, index) => ({
				title: item.title.trim(),
				position: index,
				templateId: newTemplate.id
			}));

			await tx.workOrderTemplateItem.createMany({
				data: templateItems
			});

			return newTemplate;
		});

		// Audit log
		await logAudit(userId, 'WORK_ORDER_TEMPLATE_CREATED', {
			templateId: template.id,
			name: template.name,
			isGlobal: template.isGlobal
		});

		return { success: true, template };
	} catch (e) {
		logError('Failed to create template', e, { userId, organizationId });
		return fail(500, { error: 'Failed to create template. Please try again.' });
	}
}

/**
 * Update template
 * - Ownership check (creator or manager)
 * - Transaction to update items
 * - Logs audit event
 */
export async function updateTemplate(
	event: RequestEvent,
	prisma: RequestPrisma,
	templateId: string,
	data: {
		name?: string;
		description?: string;
		title?: string;
		workDescription?: string;
		priority?: Priority;
		isActive?: boolean;
		items?: Array<{ title: string; id?: string }>;
	},
	userId: string,
	organizationId: string
) {
	// Verify access and ownership first
	const existing = await getTemplateById(prisma, templateId, organizationId);
	if ('status' in existing) {
		return existing;
	}

	// Check if user can edit (creator or manager)
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { role: true }
	});

	if (!user) {
		return fail(403, { error: 'User not found.' });
	}

	const isCreator = existing.createdBy === userId;
	const isManager = user.role === 'MANAGER' || user.role === 'ADMIN';

	if (!isCreator && !isManager) {
		return fail(403, { error: 'You can only edit your own templates.' });
	}

	// Global templates can only be edited by admins
	if (existing.isGlobal && user.role !== 'ADMIN') {
		return fail(403, { error: 'Only administrators can edit global templates.' });
	}

	try {
		const { name, description, title, workDescription, priority, isActive, items } = data;

		await prisma.$transaction(async (tx) => {
			// Update template fields
			const updateData: {
				name?: string;
				description?: string | null;
				title?: string | null;
				workDescription?: string | null;
				priority?: Priority;
				isActive?: boolean;
			} = {};

			if (name !== undefined) updateData.name = name.trim();
			if (description !== undefined) {
				updateData.description = description?.trim() || null;
			}
			if (title !== undefined) {
				updateData.title = title?.trim() || null;
			}
			if (workDescription !== undefined) {
				updateData.workDescription = workDescription?.trim() || null;
			}
			if (priority !== undefined) updateData.priority = priority;
			if (isActive !== undefined) updateData.isActive = isActive;

			if (Object.keys(updateData).length > 0) {
				await tx.workOrderTemplate.update({
					where: { id: templateId },
					data: updateData
				});
			}

			// Update items if provided
			if (items && items.length > 0) {
				// Delete existing items
				await tx.workOrderTemplateItem.deleteMany({
					where: { templateId }
				});

				// Create new items
				const templateItems = items.map((item, index) => ({
					title: item.title.trim(),
					position: index,
					templateId
				}));

				await tx.workOrderTemplateItem.createMany({
					data: templateItems
				});
			}
		});

		// Audit log
		await logAudit(userId, 'WORK_ORDER_TEMPLATE_UPDATED', {
			templateId
		});

		return { success: true };
	} catch (e) {
		logError('Failed to update template', e, { templateId, userId });
		return fail(500, { error: 'Failed to update template. Please try again.' });
	}
}

/**
 * Delete template (soft delete via isActive)
 * - Ownership check
 * - Logs audit event
 */
export async function deleteTemplate(
	event: RequestEvent,
	prisma: RequestPrisma,
	templateId: string,
	userId: string,
	organizationId: string
) {
	// Verify access and ownership first
	const existing = await prisma.workOrderTemplate.findUnique({
		where: { id: templateId },
		select: { id: true, createdBy: true, isGlobal: true, organizationId: true }
	});

	if (!existing) {
		return fail(404, { error: 'Template not found.' });
	}

	if (!existing.isGlobal && existing.organizationId !== organizationId) {
		return fail(403, { error: 'You do not have access to this template.' });
	}

	// Check permissions
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { role: true }
	});

	if (!user) {
		return fail(403, { error: 'User not found.' });
	}

	const isCreator = existing.createdBy === userId;
	const isManager = user.role === 'MANAGER' || user.role === 'ADMIN';

	if (!isCreator && !isManager) {
		return fail(403, { error: 'You can only delete your own templates.' });
	}

	if (existing.isGlobal && user.role !== 'ADMIN') {
		return fail(403, { error: 'Only administrators can delete global templates.' });
	}

	try {
		await prisma.workOrderTemplate.update({
			where: { id: templateId },
			data: { isActive: false }
		});

		// Audit log
		await logAudit(userId, 'WORK_ORDER_TEMPLATE_DELETED', {
			templateId
		});

		return { success: true };
	} catch (e) {
		logError('Failed to delete template', e, { templateId, userId });
		return fail(500, { error: 'Failed to delete template. Please try again.' });
	}
}

/**
 * Apply template to work order
 * - Returns title, description, priority, checklist items
 * - Increments usage count
 */
export async function applyTemplate(
	prisma: RequestPrisma,
	templateId: string,
	organizationId: string
) {
	// Verify access
	const template = await prisma.workOrderTemplate.findUnique({
		where: { id: templateId },
		include: {
			TemplateItems: {
				orderBy: { position: 'asc' }
			}
		}
	});

	if (!template) {
		return fail(404, { error: 'Template not found.' });
	}

	if (!template.isActive) {
		return fail(400, { error: 'This template is no longer active.' });
	}

	if (!template.isGlobal && template.organizationId !== organizationId) {
		return fail(403, { error: 'You do not have access to this template.' });
	}

	try {
		// Increment usage count
		await prisma.workOrderTemplate.update({
			where: { id: templateId },
			data: { usageCount: { increment: 1 } }
		});

		return {
			title: template.title,
			description: template.workDescription,
			priority: template.priority,
			items: template.TemplateItems.map((item) => ({
				title: item.title,
				position: item.position
			}))
		};
	} catch (e) {
		logError('Failed to apply template', e, { templateId, organizationId });
		return fail(500, { error: 'Failed to apply template. Please try again.' });
	}
}
