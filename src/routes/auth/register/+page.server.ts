import type { PageServerLoad, Actions } from './$types';
import { fail, redirect, error } from '@sveltejs/kit';
import { hashPassword, createSession, setSessionCookie } from '$lib/server/auth';
import { getPrisma } from '$lib/server/prisma';
import { validateInput, registerSchema } from '$lib/validation';
import { checkRateLimit, RATE_LIMITS } from '$lib/server/rateLimit';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, '/dashboard');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		try {
			// Rate limiting based on IP
			const ip = getClientAddress() || 'unknown';
			const rateLimitResult = checkRateLimit(
				`register:${ip}`,
				RATE_LIMITS.AUTH.limit,
				RATE_LIMITS.AUTH.windowMs
			);

			if (!rateLimitResult.success) {
				throw error(429, 'Too many registration attempts. Please try again later.');
			}

			const formData = await request.formData();
			const confirmPassword = formData.get('confirmPassword') as string;

			// Extract and validate input
			const validation = validateInput(registerSchema, {
				orgName: formData.get('orgName'),
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
					orgName: formData.get('orgName'),
					firstName: formData.get('firstName'),
					lastName: formData.get('lastName'),
					email: formData.get('email')
				});
			}

			// Password confirmation check
			if (validation.data.password !== confirmPassword) {
				return fail(400, {
					error: 'Passwords do not match',
					orgName: formData.get('orgName'),
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
				orgName: formData.get('orgName'),
				firstName: formData.get('firstName'),
				lastName: formData.get('lastName'),
				email: formData.get('email')
			});
		}

		// Create org and admin user in a transaction
		const hashedPassword = await hashPassword(validation.data.password);

		const { user } = await client.$transaction(async (tx) => {
			const org = await tx.org.create({
				data: { name: validation.data.orgName }
			});

			const user = await tx.user.create({
				data: {
					email: validation.data.email,
					password: hashedPassword,
					firstName: validation.data.firstName,
					lastName: validation.data.lastName,
					role: 'ADMIN',
					orgId: org.id
				}
			});

			return { org, user };
		});

		// Create session and log in
		const sessionId = await createSession(user.id);
		setSessionCookie(cookies, sessionId);

		throw redirect(303, '/dashboard');
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
