import type { RequestHandler } from './$types';
import { getPrisma, initEnvFromEvent } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';

export const POST: RequestHandler = async (event) => {
	// Initialize environment variables for Cloudflare Workers
	initEnvFromEvent(event);

	// Get session ID and delete from database
	const sessionId = event.cookies.get('spore_session');
	if (sessionId) {
		const client = await getPrisma();
		await client.session.delete({ where: { id: sessionId } }).catch(() => {});
	}

	// Use SvelteKit's cookie deletion - this properly handles HttpOnly, SameSite, etc.
	event.cookies.delete('spore_session', { path: '/' });

	// Use SvelteKit's redirect - framework will apply cookie changes
	throw redirect(303, '/auth/login');
};
