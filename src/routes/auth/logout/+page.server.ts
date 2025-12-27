import type { Actions } from './$types';
import { destroySession } from '$lib/server/auth';
import { initEnvFromEvent } from '$lib/server/prisma';
import { dev } from '$app/environment';

export const actions: Actions = {
	default: async (event) => {
		// Initialize environment variables for Cloudflare Workers
		// This must be called before any Prisma operations
		initEnvFromEvent(event);

		// Delete session from database
		await destroySession(event.cookies);

		// Return a manual Response with explicit Set-Cookie header
		// This is necessary because throw redirect() in Cloudflare Edge
		// may not properly send Set-Cookie headers
		const secureAttr = !dev ? 'Secure; ' : '';
		return new Response(null, {
			status: 303,
			headers: {
				Location: '/auth/login',
				'Set-Cookie': `spore_session=; Path=/; HttpOnly; SameSite=Strict; ${secureAttr}Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
			}
		});
	}
};
