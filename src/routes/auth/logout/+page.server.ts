import type { Actions, Action } from './$types';
import { getPrisma, initEnvFromEvent } from '$lib/server/prisma';
import { dev } from '$app/environment';
import { redirect } from '@sveltejs/kit';

const logoutAction: Action = async (event) => {
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
	// CRITICAL: Must match the domain where cookie was set
	// SvelteKit's cookies.delete() doesn't work reliably in Cloudflare Workers
	const secure = !dev ? ' Secure;' : '';
	const cookieValue = `spore_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT;${secure}`;

	console.log('[LOGOUT] Set-Cookie header:', cookieValue);

	// Return a Response with both the redirect and Set-Cookie header
	// We can't use redirect() because it doesn't allow custom headers
	return new Response(null, {
		status: 303,
		headers: {
			'Location': '/auth/login',
			'Set-Cookie': cookieValue
		}
	});
};

export const actions: Actions = {
	default: logoutAction
};
