import type { RequestHandler } from './$types';
import { getPrisma, initEnvFromEvent } from '$lib/server/prisma';
import { dev } from '$app/environment';

export const POST: RequestHandler = async (event) => {
	// Initialize environment variables for Cloudflare Workers
	initEnvFromEvent(event);

	// Get session ID and delete from database
	const sessionId = event.cookies.get('spore_session');
	if (sessionId) {
		const client = await getPrisma();
		await client.session.delete({ where: { id: sessionId } }).catch(() => {});
	}

	// Build Set-Cookie header with ALL attributes matching the original cookie
	// Original: path=/, httpOnly=true, sameSite=strict, secure=!dev
	const secure = !dev ? ' Secure;' : '';
	const cookieValue = `spore_session=; Path=/; HttpOnly; SameSite=Strict;${secure} Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

	// Return redirect with cookie deletion header
	// Using Response directly bypasses SvelteKit's cookie queue
	return new Response(null, {
		status: 303,
		headers: {
			'Location': '/auth/login',
			'Set-Cookie': cookieValue
		}
	});
};
