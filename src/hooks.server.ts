import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';
import { building } from '$app/environment';

// Routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/'];

export const handle: Handle = async ({ event, resolve }) => {
	// Skip auth checks during build/prerender (for Cloudflare fallback generation)
	if (building) {
		return resolve(event);
	}

	// Validate session and attach user to locals
	const user = await validateSession(event.cookies);
	event.locals.user = user;

	// Check if route requires authentication
	const isPublicRoute = publicRoutes.some(route => event.url.pathname.startsWith(route));
	
	if (!user && !isPublicRoute) {
		// Redirect to login if not authenticated and not on public route
		throw redirect(303, '/auth/login');
	}

	// If logged in and trying to access auth pages, redirect to dashboard
	if (user && event.url.pathname.startsWith('/auth/')) {
		throw redirect(303, '/dashboard');
	}

	return resolve(event);
};
