import type { Prisma } from '@prisma/client';
import type { RequestPrisma } from '$lib/types/prisma';

/**
 * Query all checklist items for a work order
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
	title: string
) {
	// Get the current max position
	const maxPositionItem = await prisma.workOrderChecklistItem.findFirst({
		where: { workOrderId },
		orderBy: { position: 'desc' },
		select: { position: true }
	});

	const newPosition = (maxPositionItem?.position ?? -1) + 1;

	return prisma.workOrderChecklistItem.create({
		data: {
			workOrderId,
			title: title.trim(),
			position: newPosition
		}
	});
}

/**
 * Toggle checklist item completion
 */
export async function toggleChecklistItem(
	prisma: RequestPrisma,
	itemId: string,
	isCompleted: boolean
) {
	return prisma.workOrderChecklistItem.update({
		where: { id: itemId },
		data: { isCompleted }
	});
}

/**
 * Delete a checklist item
 */
export async function deleteChecklistItem(prisma: RequestPrisma, itemId: string) {
	return prisma.workOrderChecklistItem.delete({
		where: { id: itemId }
	});
}

/**
 * Reorder checklist items
 */
export async function reorderChecklistItems(
	prisma: RequestPrisma,
	workOrderId: string,
	itemIds: string[]
) {
	// Update each item's position in a transaction
	const updates = itemIds.map((id, index) =>
		prisma.workOrderChecklistItem.updateMany({
			where: { id, workOrderId },
			data: { position: index }
		})
	);

	await prisma.$transaction(updates);
}
