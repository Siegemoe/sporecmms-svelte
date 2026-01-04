import type { RequestHandler } from './$types';
import { initEnvFromEvent } from '$lib/server/prisma';
import { destroySession } from '$lib/server/auth';

export const POST: RequestHandler = async (event) => {
	// Initialize environment variables for Cloudflare Workers
	initEnvFromEvent(event);

	// Destroy session using shared helper
	await destroySession(event.cookies);
	console.log('[LOGOUT] Session destroyed');

	// Return a redirect response
	return new Response(null, {
		status: 303,
		headers: {
			'Location': '/auth/login'
		}
	});
};