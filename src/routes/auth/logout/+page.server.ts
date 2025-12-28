import type { Actions } from './$types';
import { destroySession } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
	default: async (event) => {
		// Use destroySession which properly handles:
		// - Database session deletion
		// - Cookie deletion with matching attributes (path, httpOnly, sameSite, secure)
		await destroySession(event.cookies);

		// Throw redirect - with form enhancement disabled, browser handles this natively
		throw redirect(303, '/auth/login');
	}
};
