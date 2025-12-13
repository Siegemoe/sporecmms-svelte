// @ts-nocheck
import type { PageServerLoad, Actions } from './$types';
import { fail, redirect, error } from '@sveltejs/kit';
import { verifyPassword, createSession, setSessionCookie } from '$lib/server/auth';
import { getPrisma } from '$lib/server/prisma';
import { validateInput, loginSchema } from '$lib/validation';
import { checkRateLimit, RATE_LIMITS } from '$lib/server/rateLimit';

export const load = async ({ locals }: Parameters<PageServerLoad>[0]) => {
	// Already logged in
	if (locals.user) {
		throw redirect(303, '/dashboard');
	}
	return {};
};

export const actions = {
	default: async ({ request, cookies, getClientAddress }: import('./$types').RequestEvent) => {
		let formData: FormData | undefined;
		try {
			// Rate limiting based on IP
			const ip = getClientAddress() || 'unknown';
			const rateLimitResult = checkRateLimit(
				`login:${ip}`,
				RATE_LIMITS.AUTH.limit,
				RATE_LIMITS.AUTH.windowMs
			);

			if (!rateLimitResult.success) {
				throw error(429, 'Too many login attempts. Please try again later.');
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

			if (!user) {
				return fail(400, { error: 'Invalid email or password', email: formData.get('email') });
			}

			// Verify password
			const valid = await verifyPassword(validation.data.password, user.password);
			if (!valid) {
				return fail(400, { error: 'Invalid email or password', email: formData.get('email') });
			}

			// Create session
			const sessionId = await createSession(user.id);
			setSessionCookie(cookies, sessionId);

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
;null as any as Actions;