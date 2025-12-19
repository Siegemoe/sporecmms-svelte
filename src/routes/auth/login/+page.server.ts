import type { PageServerLoad, Actions } from './$types';
import { fail, redirect, error } from '@sveltejs/kit';
import { verifyPassword, createSession, setSessionCookie } from '$lib/server/auth';
import { getPrisma } from '$lib/server/prisma';
import { validateInput, loginSchema } from '$lib/validation';
import { SecurityManager, SECURITY_RATE_LIMITS } from '$lib/server/security';

export const load: PageServerLoad = async ({ locals }) => {
	// Already logged in
	if (locals.user) {
		throw redirect(303, '/dashboard');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		let formData: FormData | undefined;
		const security = SecurityManager.getInstance();
		const ip = getClientAddress() || 'unknown';

		try {
			// First check if IP is blocked
			const blockStatus = await security.isIPBlocked(ip);
			if (blockStatus.blocked) {
				await security.logSecurityEvent({
					ipAddress: ip,
					action: 'LOGIN_BLOCKED',
					details: { reason: blockStatus.reason },
					severity: 'WARNING'
				});
				return fail(403, { error: 'Access denied. Your IP address has been blocked.' });
			}

			// Then apply rate limiting
			const rateLimitResult = await security.checkRateLimit(
				{ event: { request, getClientAddress: () => ip } as any, action: 'login' },
				SECURITY_RATE_LIMITS.AUTH
			);

			if (!rateLimitResult.success) {
				if (rateLimitResult.blocked) {
					await security.logSecurityEvent({
						ipAddress: ip,
						action: 'LOGIN_BLOCKED',
						details: { reason: 'Too many login attempts' },
						severity: 'WARNING'
					});
					return fail(429, { error: 'Too many login attempts. Your IP has been temporarily blocked.' });
				}
				return fail(429, { error: 'Too many login attempts. Please try again later.' });
			}

			formData = await request.formData();

			// Validate input
			const validation = validateInput(loginSchema, {
				email: formData.get('email'),
				password: formData.get('password')
			});

			if (!validation.success) {
				const firstError = Object.values(validation.errors)[0];
				return fail(400, { error: firstError, email: formData.get('email') });
			}

			// Find user
			const client = await getPrisma();
			const user = await client.user.findUnique({
				where: { email: validation.data.email }
			});

			console.log(`[Auth Debug] User lookup for ${validation.data.email}:`, user ? 'Found' : 'Not Found');

			if (!user) {
				// Log failed login attempt
				await security.logSecurityEvent({
					ipAddress: ip,
					action: 'LOGIN_FAILED',
					details: { email: validation.data.email, reason: 'User not found' },
					severity: 'WARNING'
				});

				return fail(400, { error: 'Invalid email or password', email: formData.get('email') });
			}

			// Verify password
			const valid = await verifyPassword(validation.data.password, user.password);
			console.log(`[Auth Debug] Password verification for ${validation.data.email}:`, valid ? 'Valid' : 'Invalid');

			if (!valid) {
				// Log failed login attempt
				await security.logSecurityEvent({
					ipAddress: ip,
					action: 'LOGIN_FAILED',
					details: { email: validation.data.email, userId: user.id, reason: 'Invalid password' },
					severity: 'WARNING',
					userId: user.id
				});

				return fail(400, { error: 'Invalid email or password', email: formData.get('email') });
			}

			// Create session
			const sessionId = await createSession(user.id);
			setSessionCookie(cookies, sessionId);

			// Log successful login
			await security.logSecurityEvent({
				ipAddress: ip,
				action: 'LOGIN_SUCCESS',
				details: { email: user.email },
				severity: 'INFO',
				userId: user.id
			});

			throw redirect(303, '/dashboard');
		} catch (error) {
			// Re-throw redirects and validation errors
			if (error && typeof error === 'object' && 'location' in error) {
				throw error;
			}

			// Log error for debugging
			console.error('Login error:', error);

			// Handle other errors
			const emailValue = formData?.get('email') as string;
			return fail(500, {
				error: 'An unexpected error occurred. Please try again.',
				email: emailValue
			});
		}
	}
};
