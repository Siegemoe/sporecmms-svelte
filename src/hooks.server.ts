import type { Handle } from '@sveltejs/kit';
import { redirect, error } from '@sveltejs/kit';
import { validateSessionWithOrg } from '$lib/server/auth';
import { building } from '$app/environment';

// Routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/', '/favicon.ico', '/favicon.png'];
// Routes that require organization membership
const orgRoutes = ['/dashboard', '/work-orders', '/sites', '/assets', '/users', '/audit-log'];
// Routes for lobby state (authenticated but no org)
const lobbyRoutes = ['/onboarding', '/join-organization'];

export const handle: Handle = async ({ event, resolve }) => {
	// Skip auth checks during build/prerender (for Cloudflare fallback generation)
	if (building) {
		return resolve(event);
	}

	// Optimization: Skip auth/DB checks for static assets to prevent 500 errors
	if (event.url.pathname === '/favicon.ico' || event.url.pathname === '/favicon.png') {
		return resolve(event);
	}

	// Validate session with organization state
	try {
		console.log('[Auth] Checking cookies:', event.cookies.get('spore_session') ? 'Found' : 'Missing');
		const authResult = await validateSessionWithOrg(event.cookies);
		console.log('[Auth] Result:', authResult.state, authResult.user?.email);

		event.locals.user = authResult.user;
		event.locals.authState = authResult.state;
		event.locals.organizations = authResult.organizations || [];
		event.locals.currentOrganization = authResult.currentOrganization || null;
	} catch (err) {
		// If there's an error with auth (e.g., database connection), continue without auth
		console.error('Auth validation error:', err);
		event.locals.user = null;
		event.locals.authState = 'unauthenticated';
		event.locals.organizations = [];
		event.locals.currentOrganization = null;
		event.locals.authError = true; // Set flag for database connection issues
	}

	// Check if route requires authentication
	const isPublicRoute = publicRoutes.some(route => event.url.pathname.startsWith(route));
	const isOrgRoute = orgRoutes.some(route => event.url.pathname.startsWith(route));
	const isLobbyRoute = lobbyRoutes.some(route => event.url.pathname.startsWith(route));

	// Handle unauthenticated users
	if (event.locals.authState === 'unauthenticated' && !isPublicRoute) {
		throw redirect(303, '/auth/login');
	}

	// Handle authenticated users accessing auth pages
	if (event.locals.user && event.url.pathname.startsWith('/auth/')) {
		// If user is in lobby, send to onboarding
		if (event.locals.authState === 'lobby') {
			throw redirect(303, '/onboarding');
		}
		// If user has org, send to dashboard
		throw redirect(303, '/dashboard');
	}

	// Handle lobby state users (authenticated but no org)
	if (event.locals.authState === 'lobby' && !isLobbyRoute && !isPublicRoute) {
		throw redirect(303, '/onboarding');
	}

	// Handle org members accessing lobby routes
	if (event.locals.authState === 'org_member' && isLobbyRoute) {
		throw redirect(303, '/dashboard');
	}

	// Ensure org members are accessing org routes
	if (event.locals.authState === 'org_member' && isOrgRoute) {
		// Check if user has selected an active organization
		if (!event.locals.currentOrganization) {
			throw redirect(303, '/select-organization');
		}
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
			"script-src 'self' 'unsafe-eval' 'unsafe-inline' https://static.cloudflareinsights.com", // unsafe-inline needed for use:enhance form handling
			"style-src 'self' 'unsafe-inline'", // unsafe-inline needed for Svelte styling
			"img-src 'self' data: https:",
			"font-src 'self'",
			"connect-src 'self' https://*.prisma-data.net https://cloudflareinsights.com", // Allow Prisma Accelerate and Cloudflare Analytics
			"frame-ancestors 'none'",
			"base-uri 'self'",
			"form-action 'self'"
		].join('; ');

		response.headers.set('Content-Security-Policy', csp);
	}

	return response;
};

// Sanitize error responses in production
export const handleError = async ({ error: err, event }: any) => {
	const isProduction = event.platform?.env?.NODE_ENV === 'production' || event.url.hostname.includes('pages.dev');

	if (isProduction) {
		// Don't expose detailed errors in production
		const statusCode = err instanceof Error && 'status' in err ? (err as any).status : 500;
		const message = statusCode === 500 ? 'Something went wrong' : (err as any).message;

		return {
			message,
			code: 'INTERNAL_ERROR'
		};
	}

	// In development, let SvelteKit handle errors normally
	// By returning undefined, SvelteKit will use the default error handling
};
