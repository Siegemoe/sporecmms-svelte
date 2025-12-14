import type { Handle } from '@sveltejs/kit';
import { redirect, error } from '@sveltejs/kit';
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

	const response = await resolve(event);

	// Add security headers in production
	if (event.platform?.env?.NODE_ENV === 'production' || event.url.hostname.includes('pages.dev')) {
		// Prevent clickjacking
		response.headers.set('X-Frame-Options', 'DENY');
		// Prevent MIME type sniffing
		response.headers.set('X-Content-Type-Options', 'nosniff');
		// Control referrer information
		response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
		// Disable browser features if not needed
		response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
		// HSTS (only add if you have a valid SSL certificate)
		response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

		// Content Security Policy (Relaxed for now to troubleshoot)
		const csp = [
			"default-src 'self'",
			"script-src 'self' 'unsafe-eval'", // unsafe-eval needed for SvelteKit
			"style-src 'self' 'unsafe-inline'", // unsafe-inline needed for Svelte styling
			"img-src 'self' data: https:",
			"font-src 'self'",
			"connect-src 'self' https://*.prisma-data.net", // Allow Prisma Accelerate
			"frame-ancestors 'none'",
			"base-uri 'self'",
			"form-action 'self'"
		].join('; ');

		response.headers.set('Content-Security-Policy', csp);
	}

	return response;
};

// Sanitize error responses in production
export const handleError = async ({ error, event }: any) => {
	const isProduction = event.platform?.env?.NODE_ENV === 'production' || event.url.hostname.includes('pages.dev');

	if (isProduction) {
		// Don't expose detailed errors in production
		const statusCode = error instanceof Error && 'status' in error ? (error as any).status : 500;

		return error(statusCode, {
			message: statusCode === 500 ? 'Something went wrong' : error.message,
			code: 'INTERNAL_ERROR'
		});
	}

	// In development, let SvelteKit handle errors normally
	return error;
};
