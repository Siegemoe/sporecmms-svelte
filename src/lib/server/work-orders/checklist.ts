import type { Prisma } from '@prisma/client';
import type { RequestPrisma } from '$lib/types/prisma';
import { fail } from '@sveltejs/kit';
import { logError } from '$lib/server/logger';
import { SecurityManager } from '$lib/server/security';

/**
 * Verify work order exists and belongs to user's organization
 * Throws or returns fail() response if verification fails
 */
async function verifyWorkOrderAccess(
	prisma: RequestPrisma,
	workOrderId: string,
	userId: string,
	organizationId: string
): Promise<Prisma.PromiseReturnType<typeof prisma.workOrder.findUnique> | ReturnType<typeof fail>> {
	let workOrder;
	try {
		workOrder = await prisma.workOrder.findUnique({
			where: { id: workOrderId },
			select: { organizationId: true }
		});
	} catch (e) {
		logError('Failed to fetch work order for auth check', e, { workOrderId, userId });
		return fail(500, { error: 'Failed to verify access. Please try again.' });
	}

	if (!workOrder) {
		return fail(404, { error: 'Work order not found.' });
	}

	if (workOrder.organizationId !== organizationId) {
		const security = SecurityManager.getInstance();
		await security.logSecurityEvent({
			event: undefined,
			action: 'CHECKLIST_ACCESS_DENIED',
			details: { workOrderId, reason: 'Organization mismatch' },
			severity: 'WARNING',
			userId
		});
		return fail(403, { error: 'You do not have permission to modify this checklist.' });
	}

	return workOrder;
}

/**
 * Query all checklist items for a work order
 * (Read-only, no auth check needed - handled by calling code)
 */
export async function queryChecklistItems(prisma: RequestPrisma, workOrderId: string) {
	return prisma.workOrderChecklistItem.findMany({
		where: { workOrderId },
		orderBy: { position: 'asc' }
	});
}

/**
 * Create a new checklist item
 */
export async function createChecklistItem(
	prisma: RequestPrisma,
	workOrderId: string,
	title: string,
	userId: string,
	organizationId: string
) {
	// Verify org access
	const authResult = await verifyWorkOrderAccess(prisma, workOrderId, userId, organizationId);
	if (authResult && 'status' in authResult) {
		return authResult; // Return fail() response
	}

	try {
		// Get the current max position
		const maxPositionItem = await prisma.workOrderChecklistItem.findFirst({
			where: { workOrderId },
			orderBy: { position: 'desc' },
			select: { position: true }
		});

		const newPosition = (maxPositionItem?.position ?? -1) + 1;

		const item = await prisma.workOrderChecklistItem.create({
			data: {
				workOrderId,
				title: title.trim(),
				position: newPosition
			}
		});

		return { success: true, item };
	} catch (e) {
		logError('Failed to create checklist item', e, { workOrderId, userId });
		return fail(500, { error: 'Failed to create checklist item. Please try again.' });
	}
}

/**
 * Toggle checklist item completion
 */
export async function toggleChecklistItem(
	prisma: RequestPrisma,
	itemId: string,
	isCompleted: boolean,
	userId: string,
	organizationId: string
) {
	// Get item to verify access through work order
	let item;
	try {
		item = await prisma.workOrderChecklistItem.findUnique({
			where: { id: itemId },
			select: { workOrderId: true }
		});
	} catch (e) {
		logError('Failed to fetch checklist item for auth check', e, { itemId, userId });
		return fail(500, { error: 'Failed to verify access. Please try again.' });
	}

	if (!item) {
		return fail(404, { error: 'Checklist item not found.' });
	}

	// Verify work order access
	const authResult = await verifyWorkOrderAccess(prisma, item.workOrderId, userId, organizationId);
	if (authResult && 'status' in authResult) {
		return authResult; // Return fail() response
	}

	try {
		const updated = await prisma.workOrderChecklistItem.update({
			where: { id: itemId },
			data: { isCompleted }
		});
		return { success: true, item: updated };
	} catch (e) {
		logError('Failed to toggle checklist item', e, { itemId, userId });
		return fail(500, { error: 'Failed to update checklist item. Please try again.' });
	}
}

/**
 * Delete a checklist item
 */
export async function deleteChecklistItem(
	prisma: RequestPrisma,
	itemId: string,
	userId: string,
	organizationId: string
) {
	// Get item to verify access through work order
	let item;
	try {
		item = await prisma.workOrderChecklistItem.findUnique({
			where: { id: itemId },
			select: { workOrderId: true }
		});
	} catch (e) {
		logError('Failed to fetch checklist item for auth check', e, { itemId, userId });
		return fail(500, { error: 'Failed to verify access. Please try again.' });
	}

	if (!item) {
		return fail(404, { error: 'Checklist item not found.' });
	}

	// Verify work order access
	const authResult = await verifyWorkOrderAccess(prisma, item.workOrderId, userId, organizationId);
	if (authResult && 'status' in authResult) {
		return authResult; // Return fail() response
	}

	try {
		await prisma.workOrderChecklistItem.delete({
			where: { id: itemId }
		});
		return { success: true };
	} catch (e) {
		logError('Failed to delete checklist item', e, { itemId, userId });
		return fail(500, { error: 'Failed to delete checklist item. Please try again.' });
	}
}

/**
 * Reorder checklist items
 */
export async function reorderChecklistItems(
	prisma: RequestPrisma,
	workOrderId: string,
	itemIds: string[],
	userId: string,
	organizationId: string
) {
	// Verify org access
	const authResult = await verifyWorkOrderAccess(prisma, workOrderId, userId, organizationId);
	if (authResult && 'status' in authResult) {
		return authResult; // Return fail() response
	}

	try {
		// Update each item's position in a transaction
		const updates = itemIds.map((id, index) =>
			prisma.workOrderChecklistItem.updateMany({
				where: { id, workOrderId },
				data: { position: index }
			})
		);

		await prisma.$transaction(updates);
		return { success: true };
	} catch (e) {
		logError('Failed to reorder checklist items', e, { workOrderId, userId });
		return fail(500, { error: 'Failed to reorder checklist items. Please try again.' });
	}
}
