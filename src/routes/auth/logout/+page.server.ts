import type { Actions } from './$types';
import { getPrisma, initEnvFromEvent } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';

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

		// Throw redirect - with form enhancement disabled, browser handles this natively
		throw redirect(303, '/auth/login');
	}
};
