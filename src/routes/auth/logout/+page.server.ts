import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { destroySession } from '$lib/server/auth';
import { initEnvFromEvent } from '$lib/server/prisma';

export const actions: Actions = {
	default: async (event) => {
		// Initialize environment variables for Cloudflare Workers
		// This must be called before any Prisma operations
		initEnvFromEvent(event);

		await destroySession(event.cookies);
		throw redirect(303, '/auth/login');
	}
};
