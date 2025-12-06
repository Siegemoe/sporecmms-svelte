// @ts-nocheck
import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { verifyPassword, createSession, setSessionCookie } from '$lib/server/auth';
import { prisma } from '$lib/server/prisma';

export const load = async ({ locals }: Parameters<PageServerLoad>[0]) => {
	// Already logged in
	if (locals.user) {
		throw redirect(303, '/dashboard');
	}
	return {};
};

export const actions = {
	default: async ({ request, cookies }: import('./$types').RequestEvent) => {
		try {
			const formData = await request.formData();
			const email = formData.get('email') as string;
			const password = formData.get('password') as string;

			if (!email || !password) {
				return fail(400, { error: 'Email and password are required', email });
			}

			// Find user
			const user = await prisma.user.findUnique({
				where: { email: email.toLowerCase().trim() }
			});

			if (!user) {
				return fail(400, { error: 'Invalid email or password', email });
			}

			// Verify password
			const valid = await verifyPassword(password, user.password);
			if (!valid) {
				return fail(400, { error: 'Invalid email or password', email });
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
			return fail(500, {
				error: 'An unexpected error occurred. Please try again.',
				email: formData?.get('email') as string
			});
		}
	}
};
;null as any as Actions;