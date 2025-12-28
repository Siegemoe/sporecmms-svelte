// @ts-nocheck
import type { PageServerLoad } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import { requireAuth } from '$lib/server/guards';

const RECENT_WORK_ORDERS_LIMIT = 5;

export const load = async (event: Parameters<PageServerLoad>[0]) => {
	try {
		requireAuth(event);

		const prisma = await createRequestPrisma(event);
		const organizationId = event.locals.user!.organizationId ?? undefined;

		// Get work order stats
		const [total, pending, inProgress, completed] = await Promise.all([
			prisma.workOrder.count({ where: { organizationId } }),
			prisma.workOrder.count({ where: { status: 'PENDING', organizationId } }),
			prisma.workOrder.count({ where: { status: 'IN_PROGRESS', organizationId } }),
			prisma.workOrder.count({ where: { status: 'COMPLETED', organizationId } })
		]);

		// Get recent work orders with location data
		const recentWorkOrders = await prisma.workOrder.findMany({
			where: { organizationId },
			take: RECENT_WORK_ORDERS_LIMIT,
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

		// Get sites with room (unit) counts
		const sites = await prisma.site.findMany({
			where: { organizationId },
			include: {
				_count: {
					select: { Unit: true }
				}
			}
		});

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