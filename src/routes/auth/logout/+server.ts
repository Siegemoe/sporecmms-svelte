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

	// Use SvelteKit's cookie API to delete the session cookie
	// This properly formats the Set-Cookie header for Cloudflare Workers
	event.cookies.set('spore_session', '', {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: !dev,
		expires: new Date(0),
		maxAge: 0
	});

	console.log('[LOGOUT] Cookie deleted via cookies.set()');

	// Return a redirect response
	return new Response(null, {
		status: 303,
		headers: {
			'Location': '/auth/login'
		}
	});
};
