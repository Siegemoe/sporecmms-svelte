import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { verifyPassword, createSession, setSessionCookie } from '$lib/server/auth';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	// Already logged in
	if (locals.user) {
		throw redirect(303, '/dashboard');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		console.log('[LOGIN] Login attempt started');

		try {
			const formData = await request.formData();
			const email = formData.get('email') as string;
			const password = formData.get('password') as string;

			console.log('[LOGIN] Form data:', { email: email, hasPassword: !!password });

			if (!email || !password) {
				console.log('[LOGIN] Missing email or password');
				return fail(400, { error: 'Email and password are required', email });
			}

			console.log('[LOGIN] Looking up user...');
			// Find user
			const user = await prisma.user.findUnique({
				where: { email: email.toLowerCase().trim() }
			});

			console.log('[LOGIN] User lookup result:', user ? 'Found' : 'Not found');

			if (!user) {
				return fail(400, { error: 'Invalid email or password', email });
			}

			console.log('[LOGIN] Verifying password...');
			// Verify password
			const valid = await verifyPassword(password, user.password);
			console.log('[LOGIN] Password verification result:', valid);

			if (!valid) {
				return fail(400, { error: 'Invalid email or password', email });
			}

			console.log('[LOGIN] Creating session...');
			// Create session
			const sessionId = await createSession(user.id);
			console.log('[LOGIN] Session created with ID:', sessionId);

			console.log('[LOGIN] Setting cookie...');
			setSessionCookie(cookies, sessionId);
			console.log('[LOGIN] Cookie set successfully');

			console.log('[LOGIN] Redirecting to dashboard...');
			throw redirect(303, '/dashboard');
		} catch (error) {
			console.error('[LOGIN] ERROR:', error);
			console.error('[LOGIN] ERROR TYPE:', typeof error);
			console.error('[LOGIN] ERROR STACK:', error instanceof Error ? error.stack : 'No stack');

			// Re-throw redirects and validation errors
			if (error && typeof error === 'object' && 'location' in error) {
				console.log('[LOGIN] This is a redirect error, re-throwing...');
				throw error;
			}

			// Handle other errors
			return fail(500, {
				error: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
				email: formData?.get('email') as string
			});
		}
	}
};
