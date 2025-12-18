import { json } from '@sveltejs/kit';
import { createRequestPrisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types';

// Simple in-memory cache to avoid hitting the database too frequently
const activityCache = new Map<string, any>();
const CACHE_TTL = 5000; // 5 seconds

export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		const orgId = locals.user?.orgId;
		if (!orgId) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const now = Date.now();
		const cacheKey = orgId;
		const cached = activityCache.get(cacheKey);

		// Return cached data if still fresh
		if (cached && (now - cached.timestamp) < CACHE_TTL) {
			return json({
				activities: cached.activities,
				cached: true
			});
		}

		const prisma = await createRequestPrisma({ locals } as any);

		// Get recent activity from work orders
		const recentWorkOrders = await prisma.workOrder.findMany({
			where: {
				orgId,
				updatedAt: {
					gte: new Date(now - 60000) // Last minute of activity
				}
			},
			include: {
				asset: {
					include: {
						unit: true // Changed from room
					}
				},
				assignedTo: true
			},
			orderBy: {
				updatedAt: 'desc'
			},
			take: 20
		});

		// Transform to activity format
		const activities = recentWorkOrders.map(wo => ({
			type: 'WO_UPDATE',
			payload: {
				id: wo.id,
				title: wo.title,
				status: wo.status,
				assetName: wo.asset?.name || 'Unknown Asset',
				assignedTo: wo.assignedTo?.firstName || wo.assignedTo?.email || 'Unassigned'
			},
			timestamp: wo.updatedAt.getTime()
		}));

		// Cache the result
		activityCache.set(cacheKey, {
			activities,
			timestamp: now
		});

		return json({
			activities,
			cached: false
		});

	} catch (error) {
		console.error('[Activity API] Error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
