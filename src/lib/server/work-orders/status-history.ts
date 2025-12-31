import type { WorkOrderStatus } from '@prisma/client';

/**
 * Record a status change in the work order's history
 */
export async function recordStatusChange(
	prisma: any,
	workOrderId: string,
	fromStatus: WorkOrderStatus | null,
	toStatus: WorkOrderStatus,
	userId: string | null,
	reason?: string
) {
	try {
		await prisma.workOrderStatusHistory.create({
			data: {
				workOrderId,
				fromStatus: fromStatus || 'PENDING',
				toStatus,
				reason: reason || null,
				userId
			}
		});
	} catch (e) {
		console.error('Failed to record status history:', e);
		// Don't throw - status change is more important than history
	}
}

/**
 * Query status history for a work order
 */
export async function queryStatusHistory(
	prisma: any,
	workOrderId: string
) {
	return prisma.workOrderStatusHistory.findMany({
		where: { workOrderId },
		orderBy: { createdAt: 'desc' },
		include: {
			user: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true
				}
			}
		}
	});
}

/**
 * Transform status history for frontend display
 */
export function formatStatusHistory(history: Array<{
	fromStatus: WorkOrderStatus;
	toStatus: WorkOrderStatus;
	reason: string | null;
	createdAt: Date;
	user: {
		id: string;
		firstName: string | null;
		lastName: string | null;
		email: string;
	} | null;
}>) {
	return history.map((h) => ({
		...h,
		user: h.user ? {
			...h.user,
			displayName: h.user.firstName
				? [h.user.firstName, h.user.lastName].filter(Boolean).join(' ')
				: h.user.email
		} : null
	}));
}
