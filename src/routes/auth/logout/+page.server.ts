import type { Actions } from './$types';
import { getPrisma, initEnvFromEvent } from '$lib/server/prisma';

export const actions: Actions = {
	default: async (event) => {
		// Initialize environment variables for Cloudflare Workers
		initEnvFromEvent(event);

		// Delete session from database
		const sessionId = event.cookies.get('spore_session');
		if (sessionId) {
			const client = await getPrisma();
			await client.session.delete({ where: { id: sessionId } }).catch(() => {});
		}

		// Delete cookie - match EXACT attributes from setSessionCookie
		// Original: path=/, httpOnly=true, sameSite=strict, secure=!dev, NO domain
		event.cookies.delete('spore_session', { path: '/' });

		// Return redirect instead of throw redirect
		// CRITICAL: throw redirect() causes cookies to be lost (GitHub #6792)
		return new Response(null, {
			status: 303,
			headers: { Location: '/auth/login' }
		});
	}
};
