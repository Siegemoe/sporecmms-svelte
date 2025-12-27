// @ts-nocheck
import type { Actions } from './$types';
import { getPrisma, initEnvFromEvent } from '$lib/server/prisma';
import { dev } from '$app/environment';

export const actions = {
	default: async (event: import('./$types').RequestEvent) => {
		// Initialize environment variables for Cloudflare Workers
		initEnvFromEvent(event);

		// Get session ID and delete from database ONLY
		// We do NOT use destroySession() because it calls cookies.set()
		// which conflicts with our manual Response Set-Cookie header
		const sessionId = event.cookies.get('spore_session');
		if (sessionId) {
			const client = await getPrisma();
			await client.session.delete({ where: { id: sessionId } }).catch(() => {});
		}

		// Use Headers API for better Cloudflare Workers compatibility
		// This avoids the conflict between SvelteKit's cookie queue and manual Response
		const headers = new Headers();
		headers.set('Location', '/auth/login');

		// Build Set-Cookie string with ALL attributes matching the original cookie
		// Original: path=/, httpOnly=true, sameSite=strict, secure=!dev
		const secure = !dev ? ' Secure;' : '';
		headers.append('Set-Cookie',
			`spore_session=; Path=/; HttpOnly; SameSite=Strict;${secure} Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
		);

		return new Response(null, {
			status: 303,
			headers
		});
	}
};
;null as any as Actions;