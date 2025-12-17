import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { building } from '$app/environment';

export const load: PageServerLoad = async ({ locals }) => {
	// During build, don't redirect - let the page render for fallback generation
	if (building) {
		return {};
	}

	// If there's an auth error (database connection issues), show landing page
	if ((locals as any).authError) {
		return { authError: true };
	}

	if (locals.user) {
		throw redirect(302, '/dashboard');
	}
	throw redirect(302, '/auth/login');
};
