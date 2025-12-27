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

	// Try multiple cookie deletion methods to ensure it works across environments
	// Method 1: cookies.delete() with path
	event.cookies.delete('spore_session', { path: '/' });

	// Method 2: cookies.set() with empty value and expiration
	// This is more explicit and matches the original cookie attributes
	event.cookies.set('spore_session', '', {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: !dev,
		maxAge: 0,
		expires: new Date(0)
	});

	// Return 200 - client-side JavaScript handles navigation
	return new Response(JSON.stringify({ success: true }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
