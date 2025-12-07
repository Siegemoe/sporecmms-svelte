import type { PageServerLoad } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import { requireAuth } from '$lib/server/guards';

export const load: PageServerLoad = async (event) => {
	try {
		requireAuth(event);

		console.log('[DASHBOARD] Loading dashboard for user:', event.locals.user?.id);

		const prisma = await createRequestPrisma(event);

		// Get work order stats
		const [total, pending, inProgress, completed] = await Promise.all([
			prisma.workOrder.count(),
			prisma.workOrder.count({ where: { status: 'PENDING' } }),
			prisma.workOrder.count({ where: { status: 'IN_PROGRESS' } }),
			prisma.workOrder.count({ where: { status: 'COMPLETED' } })
		]);

		console.log('[DASHBOARD] Stats loaded:', { total, pending, inProgress, completed });

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

		console.log('[DASHBOARD] Recent work orders loaded:', recentWorkOrders.length);

		// Get sites with room counts
		const sites = await prisma.site.findMany({
			include: {
				_count: {
					select: { rooms: true }
				}
			}
		});

		console.log('[DASHBOARD] Sites loaded:', sites.length);

		return {
			stats: { total, pending, inProgress, completed },
			recentWorkOrders,
			sites
		};
	} catch (error) {
		console.error('[DASHBOARD] Error loading dashboard:', error);
		throw error;
	}
};
