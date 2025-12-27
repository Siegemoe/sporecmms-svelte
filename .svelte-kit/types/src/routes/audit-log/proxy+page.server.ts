// @ts-nocheck
import type { PageServerLoad } from './$types';
import { getPrisma, initEnvFromEvent } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';
import { isAdmin } from '$lib/server/guards';

export const load = async (event: Parameters<PageServerLoad>[0]) => {
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
	const client = await getPrisma();
	const auditLogs = await client.auditLog.findMany({
		where: {
			User: { organizationId: organizationId ?? undefined }
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
			User: { organizationId: organizationId ?? undefined }
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