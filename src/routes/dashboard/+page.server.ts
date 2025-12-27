import type { PageServerLoad } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import { requireAuth } from '$lib/server/guards';

export const load: PageServerLoad = async (event) => {
	try {
		requireAuth(event);

		console.log('[DASHBOARD] Loading dashboard for user:', event.locals.user?.id);

		const prisma = await createRequestPrisma(event);
		const organizationId = event.locals.user!.organizationId ?? undefined;

		// Get work order stats
		const [total, pending, inProgress, completed] = await Promise.all([
			prisma.workOrder.count({ where: { organizationId } }),
			prisma.workOrder.count({ where: { status: 'PENDING', organizationId } }),
			prisma.workOrder.count({ where: { status: 'IN_PROGRESS', organizationId } }),
			prisma.workOrder.count({ where: { status: 'COMPLETED', organizationId } })
		]);

		console.log('[DASHBOARD] Stats loaded:', { total, pending, inProgress, completed });

		// Get recent work orders with location data
		const recentWorkOrders = await prisma.workOrder.findMany({
			where: { organizationId },
			take: 5,
			orderBy: { updatedAt: 'desc' },
			include: {
				Asset: {
					include: {
						Unit: {
							select: {
								name: true,
								roomNumber: true,
								Building: true,
								floor: true,
								Site: {
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
			where: { organizationId },
			include: {
				_count: {
					select: { Unit: true }
				}
			}
		});

		console.log('[DASHBOARD] Sites loaded:', sites.length);

		// Map data for frontend compatibility
		const mappedRecentWorkOrders = recentWorkOrders.map(wo => ({
			...wo,
			asset: wo.Asset ? {
				...wo.Asset,
				room: wo.Asset.Unit ? {
					...wo.Asset.Unit,
					name: wo.Asset.Unit.name || wo.Asset.Unit.roomNumber
				} : null
			} : null
		}));

		const mappedSites = sites.map(site => ({
			...site,
			_count: {
				rooms: site._count.Unit
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