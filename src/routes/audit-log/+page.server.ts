import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';
import { isAdmin } from '$lib/server/guards';

export const load: PageServerLoad = async (event) => {
	// Only admins can view audit logs
	if (!isAdmin(event)) {
		throw error(403, 'Access denied. Admin privileges required.');
	}

	const orgId = event.locals.user!.orgId;
	const page = parseInt(event.url.searchParams.get('page') || '1');
	const limit = 50;
	const skip = (page - 1) * limit;

	// Get audit logs for users in this org
	const auditLogs = await prisma.auditLog.findMany({
		where: {
			user: { orgId }
		},
		orderBy: { createdAt: 'desc' },
		skip,
		take: limit,
		include: {
			user: {
				select: {
					firstName: true,
					lastName: true,
					email: true
				}
			}
		}
	});

	const totalCount = await prisma.auditLog.count({
		where: {
			user: { orgId }
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
