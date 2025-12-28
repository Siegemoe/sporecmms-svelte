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

	// Manually construct Set-Cookie header to delete the session cookie
	// Must match the attributes used when setting the cookie
	// setSessionCookie uses: path=/, httpOnly, sameSite=strict, secure=!dev, NO domain
	const secure = !dev ? ' Secure;' : '';
	const cookieValue = `spore_session=; Path=/; HttpOnly; SameSite=Strict;${secure} Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

	console.log('[LOGOUT] Set-Cookie header:', cookieValue);

	// Return a redirect response with Set-Cookie header
	// Using 303 See Other which causes the browser to GET the redirect location
	return new Response(null, {
		status: 303,
		headers: {
			'Location': '/auth/login',
			'Set-Cookie': cookieValue
		}
	});
};
