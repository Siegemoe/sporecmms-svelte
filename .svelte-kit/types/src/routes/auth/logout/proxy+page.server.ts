// @ts-nocheck
import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { destroySession } from '$lib/server/auth';

export const actions = {
	default: async ({ cookies }: import('./$types').RequestEvent) => {
		await destroySession(cookies);
		throw redirect(303, '/auth/login');
	}
};
;null as any as Actions;