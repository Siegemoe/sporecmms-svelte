import type { RequestHandler } from './$types';
import { getPrisma, initEnvFromEvent } from '$lib/server/prisma';
import { dev } from '$app/environment';

export const POST: RequestHandler = async (event) => {
	// Initialize environment variables for Cloudflare Workers
	initEnvFromEvent(event);

	// Get session ID and delete from database
	const sessionId = event.cookies.get('spore_session');
	console.log('[LOGOUT] Session ID:', sessionId || 'NOT FOUND');

	if (sessionId) {
		const client = await getPrisma();
		try {
			await client.session.delete({ where: { id: sessionId } });
			console.log('[LOGOUT] Session deleted successfully');
		} catch (error) {
			console.error('[LOGOUT] Failed to delete session:', error);
		}
	} else {
		console.log('[LOGOUT] No session ID found, nothing to delete');
	}

	// Manually construct Set-Cookie header with ALL original cookie attributes
	// CRITICAL: Domain must match the original cookie domain (sporecmms.com)
	const secure = !dev ? ' Secure;' : '';
	const cookieValue = `spore_session=; Path=/; HttpOnly; SameSite=Strict; Domain=sporecmms.com;${secure} Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

	console.log('[LOGOUT] Set-Cookie header:', cookieValue);

	// Return response with manual Set-Cookie header
	// This bypasses SvelteKit's cookie API which doesn't work in Cloudflare Workers
	return new Response(JSON.stringify({ success: true }), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Set-Cookie': cookieValue
		}
	});
};
