import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { hashPassword, createSession, setSessionCookie } from '$lib/server/auth';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, '/dashboard');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		try {
			console.log('[REGISTER] Starting registration process');
			const formData = await request.formData();
			const orgName = formData.get('orgName') as string;
			const firstName = formData.get('firstName') as string;
			const lastName = formData.get('lastName') as string;
			const email = formData.get('email') as string;
			const password = formData.get('password') as string;
			const confirmPassword = formData.get('confirmPassword') as string;

		// Validation
		if (!orgName?.trim()) {
			return fail(400, { error: 'Organization name is required', orgName, firstName, lastName, email });
		}
		if (!firstName?.trim()) {
			return fail(400, { error: 'First name is required', orgName, firstName, lastName, email });
		}
		if (!email?.trim()) {
			return fail(400, { error: 'Email is required', orgName, firstName, lastName, email });
		}
		if (!password || password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters', orgName, firstName, lastName, email });
		}
		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match', orgName, firstName, lastName, email });
		}

		// Check if email already exists
		console.log('[REGISTER] Getting Prisma client');
		const client = await prisma;
		console.log('[REGISTER] Prisma client obtained, checking for existing user');
		const existingUser = await client.user.findUnique({
			where: { email: email.toLowerCase().trim() }
		});
		console.log('[REGISTER] Existing user check complete');
		if (existingUser) {
			return fail(400, { error: 'An account with this email already exists', orgName, firstName, lastName, email });
		}

		// Create org and admin user in a transaction
		const hashedPassword = await hashPassword(password);

		const { user } = await client.$transaction(async (tx) => {
			const org = await tx.org.create({
				data: { name: orgName.trim() }
			});

			const user = await tx.user.create({
				data: {
					email: email.toLowerCase().trim(),
					password: hashedPassword,
					firstName: firstName.trim(),
					lastName: lastName?.trim() || null,
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
