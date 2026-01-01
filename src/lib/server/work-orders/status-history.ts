import type { WorkOrderStatus } from '@prisma/client';
import type { RequestPrisma } from '$lib/types/prisma';
import { formatUserName } from '$lib/utils/user';
import { logError } from '$lib/server/logger';

/**
 * Record a status change in the work order's history
 */
export async function recordStatusChange(
	prisma: RequestPrisma,
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
		logError('Failed to record status history', e, { workOrderId, fromStatus, toStatus });
		// Don't throw - status change is more important than history
	}
}

/**
 * Query status history for a work order
 */
export async function queryStatusHistory(
	prisma: RequestPrisma,
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
			displayName: formatUserName(h.user)
		} : null
	}));
}
