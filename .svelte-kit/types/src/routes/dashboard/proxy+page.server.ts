// @ts-nocheck
import type { PageServerLoad } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import { requireAuth } from '$lib/server/guards';

export const load = async (event: Parameters<PageServerLoad>[0]) => {
	requireAuth(event);
	
	const prisma = createRequestPrisma(event);

	// Get work order stats
	const [total, pending, inProgress, completed] = await Promise.all([
		prisma.workOrder.count(),
		prisma.workOrder.count({ where: { status: 'PENDING' } }),
		prisma.workOrder.count({ where: { status: 'IN_PROGRESS' } }),
		prisma.workOrder.count({ where: { status: 'COMPLETED' } })
	]);

	// Get recent work orders with location data
	const recentWorkOrders = await prisma.workOrder.findMany({
		take: 5,
		orderBy: { updatedAt: 'desc' },
		include: {
			asset: {
				include: {
					room: {
						select: {
							name: true,
							building: true,
							floor: true,
							site: {
								select: { name: true }
							}
						}
					}
				}
			}
		}
	});

	// Get sites with room counts
	const sites = await prisma.site.findMany({
		include: {
			_count: {
				select: { rooms: true }
			}
		}
	});

	return {
		stats: { total, pending, inProgress, completed },
		recentWorkOrders,
		sites
	};
};
