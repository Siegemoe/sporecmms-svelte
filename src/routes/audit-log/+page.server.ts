import type { PageServerLoad } from './$types';
import { getPrisma, initEnvFromEvent } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';
import { isAdmin } from '$lib/server/guards';

export const load: PageServerLoad = async (event) => {
	// Initialize environment variables for Cloudflare Workers
	initEnvFromEvent(event);

	// Only admins can view audit logs
	if (!isAdmin(event)) {
		throw error(403, 'Access denied. Admin privileges required.');
	}

	const organizationId = event.locals.user!.organizationId;
	const page = parseInt(event.url.searchParams.get('page') || '1');
	const limit = 50;
	const skip = (page - 1) * limit;

	// Get audit logs for users in this org
	// Use a subquery approach to filter by organizationId through the User relation
	const client = await getPrisma();

	// First, get all user IDs in this organization
	const userIdsInOrg = await client.user
		.findMany({
			where: { organizationId: organizationId ?? undefined },
			select: { id: true }
		})
		.then((users) => users.map((u) => u.id));

	// Then get audit logs for those users
	const auditLogs = await client.auditLog.findMany({
		where: {
			userId: { in: userIdsInOrg }
		},
		orderBy: { createdAt: 'desc' },
		skip,
		take: limit,
		include: {
			User: {
				select: {
					firstName: true,
					lastName: true,
					email: true
				}
			}
		}
	});

	const totalCount = await client.auditLog.count({
		where: {
			userId: { in: userIdsInOrg }
		}
	});

	const totalPages = Math.ceil(totalCount / limit);

	return { 
		auditLogs, 
		page, 
		totalPages,
		totalCount 
	};
};