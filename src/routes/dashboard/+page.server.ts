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
						unit: {
							select: {
								name: true,
								roomNumber: true,
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

		// Get sites with room (unit) counts
		const sites = await prisma.site.findMany({
			include: {
				_count: {
					select: { units: true }
				}
			}
		});

		console.log('[DASHBOARD] Sites loaded:', sites.length);

		// Map data for frontend compatibility
		const mappedRecentWorkOrders = recentWorkOrders.map(wo => ({
			...wo,
			asset: wo.asset ? {
				...wo.asset,
				room: wo.asset.unit ? {
					...wo.asset.unit,
					name: wo.asset.unit.name || wo.asset.unit.roomNumber
				} : null
			} : null
		}));

		const mappedSites = sites.map(site => ({
			...site,
			_count: {
				rooms: site._count.units
			}
		}));

		return {
			stats: { total, pending, inProgress, completed },
			recentWorkOrders: mappedRecentWorkOrders,
			sites: mappedSites
		};
	} catch (error) {
		console.error('[DASHBOARD] Error loading dashboard:', error);
		throw error;
	}
};