import { json } from '@sveltejs/kit';
import { SecurityManager } from '$lib/server/security';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
	// Only admins can view blocked IPs
	if (!locals.user || locals.user.role !== 'ADMIN') {
		return json({ error: 'Unauthorized' }, { status: 403 });
	}

	const security = SecurityManager.getInstance();

	// Parse query parameters
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const offset = parseInt(url.searchParams.get('offset') || '0');

	try {
		const result = await security.getBlockedIPs(limit, offset);
		return json(result);
	} catch (error) {
		console.error('Blocked IPs API error:', error);
		return json({ error: 'Failed to fetch blocked IPs' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ locals, request }) => {
	// Only admins can block IPs
	if (!locals.user || locals.user.role !== 'ADMIN') {
		return json({ error: 'Unauthorized' }, { status: 403 });
	}

	const security = SecurityManager.getInstance();

	try {
		const { ipAddress, reason, severity } = await request.json();

		if (!ipAddress || !reason) {
			return json({ error: 'IP address and reason are required' }, { status: 400 });
		}

		await security.blockIP(
			ipAddress,
			reason,
			severity || 'TEMPORARY',
			locals.user.id
		);

		return json({ success: true, message: 'IP blocked successfully' });
	} catch (error) {
		console.error('Block IP API error:', error);
		return json({ error: 'Failed to block IP' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ locals, request }) => {
	// Only admins can unblock IPs
	if (!locals.user || locals.user.role !== 'ADMIN') {
		return json({ error: 'Unauthorized' }, { status: 403 });
	}

	const security = SecurityManager.getInstance();

	try {
		const { ipAddress } = await request.json();

		if (!ipAddress) {
			return json({ error: 'IP address is required' }, { status: 400 });
		}

		await security.unblockIP(ipAddress, locals.user.id);

		return json({ success: true, message: 'IP unblocked successfully' });
	} catch (error) {
		console.error('Unblock IP API error:', error);
		return json({ error: 'Failed to unblock IP' }, { status: 500 });
	}
};