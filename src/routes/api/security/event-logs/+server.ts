import { json } from '@sveltejs/kit';
import { SecurityManager } from '$lib/server/security';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user || locals.user.role !== 'ADMIN') {
		return json({ error: 'Unauthorized' }, { status: 403 });
	}

	const security = SecurityManager.getInstance();

	// Parse query parameters
	const severity = url.searchParams.get('severity') || undefined;
	const action = url.searchParams.get('action') || undefined;
	const ipAddress = url.searchParams.get('ipAddress') || undefined;
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const offset = parseInt(url.searchParams.get('offset') || '0');
	const startDate = url.searchParams.get('startDate')
		? new Date(url.searchParams.get('startDate')!)
		: undefined;
	const endDate = url.searchParams.get('endDate')
		? new Date(url.searchParams.get('endDate')!)
		: undefined;

	try {
		const result = await security.getSecurityLogs({
			severity,
			action,
			ipAddress,
			limit,
			offset,
			startDate,
			endDate,
			organizationId: locals.user.organizationId ?? undefined // Filter by organization
		});

		return json(result);
	} catch (error) {
		console.error('Security logs API error:', error);
		return json({ error: 'Failed to fetch security logs' }, { status: 500 });
	}
};