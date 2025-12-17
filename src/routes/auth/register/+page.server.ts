import type { PageServerLoad, Actions } from './$types';
import { fail, redirect, error } from '@sveltejs/kit';
import { hashPassword, createSession, setSessionCookie } from '$lib/server/auth';
import { getPrisma } from '$lib/server/prisma';
import { validateInput, registerSchema } from '$lib/validation';
import { SecurityManager, SECURITY_RATE_LIMITS } from '$lib/server/security';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, '/dashboard');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		const security = SecurityManager.getInstance();
		const ip = getClientAddress() || 'unknown';

		try {
			// First check if IP is blocked
			const blockStatus = await security.isIPBlocked(ip);
			if (blockStatus.blocked) {
				await security.logSecurityEvent({
					ipAddress: ip,
					action: 'REGISTER_BLOCKED',
					details: { reason: blockStatus.reason },
					severity: 'WARNING'
				});
				return fail(403, { error: 'Access denied. Your IP address has been blocked.' });
			}

			// Then apply rate limiting
			const rateLimitResult = await security.checkRateLimit(
				{ event: { request, getClientAddress: () => ip } as any, action: 'register' },
				SECURITY_RATE_LIMITS.AUTH
			);

			if (!rateLimitResult.success) {
				if (rateLimitResult.blocked) {
					await security.logSecurityEvent({
						ipAddress: ip,
						action: 'REGISTER_BLOCKED',
						details: { reason: 'Too many registration attempts' },
						severity: 'WARNING'
					});
					return fail(429, { error: 'Too many registration attempts. Your IP has been temporarily blocked.' });
				}
				return fail(429, { error: 'Too many registration attempts. Please try again later.' });
			}

			const formData = await request.formData();
			const confirmPassword = formData.get('confirmPassword') as string;

			// Extract and validate input
			const validation = validateInput(registerSchema, {
				firstName: formData.get('firstName'),
				lastName: formData.get('lastName'),
				email: formData.get('email'),
				password: formData.get('password')
			});

			if (!validation.success) {
				// Return first error message with form data
				const firstError = Object.values(validation.errors)[0];
				return fail(400, {
					error: firstError,
					firstName: formData.get('firstName'),
					lastName: formData.get('lastName'),
					email: formData.get('email')
				});
			}

			// Password confirmation check
			if (validation.data.password !== confirmPassword) {
				return fail(400, {
					error: 'Passwords do not match',
					firstName: formData.get('firstName'),
					lastName: formData.get('lastName'),
					email: formData.get('email')
				});
			}

		// Check if email already exists
		const client = await getPrisma();
		const existingUser = await client.user.findUnique({
			where: { email: validation.data.email }
		});

		if (existingUser) {
			return fail(400, {
				error: 'An account with this email already exists',
				firstName: formData.get('firstName'),
				lastName: formData.get('lastName'),
				email: formData.get('email')
			});
		}

		// Create user without organization (lobby state)
		const hashedPassword = await hashPassword(validation.data.password);

		const user = await client.user.create({
			data: {
				email: validation.data.email,
				password: hashedPassword,
				firstName: validation.data.firstName,
				lastName: validation.data.lastName,
				role: 'TECHNICIAN', // Default role, can be changed when joining org
				orgId: null // Explicitly set to null for lobby state
			}
		});

		// Create session and log in
		const sessionId = await createSession(user.id);
		setSessionCookie(cookies, sessionId);

		// Redirect to onboarding since user has no organization
		throw redirect(303, '/onboarding');
		} catch (error) {
			console.error('[REGISTER] Error:', error);
			console.error('[REGISTER] Stack:', error.stack);
			return fail(500, {
				error: 'Internal server error during registration. Please try again.',
				details: error.message
			});
		}
	}
};
