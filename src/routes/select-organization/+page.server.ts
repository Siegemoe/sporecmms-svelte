import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { getPrisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect if user is not authenticated
	if (!locals.user) {
		throw redirect(303, '/auth/login');
	}

	// Redirect if user is in lobby state
	if (locals.authState === 'lobby') {
		throw redirect(303, '/onboarding');
	}

	// Get all organizations the user belongs to
	const client = await getPrisma();
	const userOrgs = await client.organization.findMany({
		where: {
			users: {
				some: {
					id: locals.user!.id
				}
			}
		},
		select: {
			id: true,
			name: true
		}
	});

	return {
		organizations: userOrgs,
		currentOrganization: locals.currentOrganization
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(303, '/auth/login');
		}

		if (locals.authState !== 'org_member') {
			throw redirect(303, '/onboarding');
		}

		const formData = await request.formData();
		const organizationId = formData.get('organizationId') as string;

		if (!organizationId) {
			return fail(400, { error: 'Please select an organization' });
		}

		const client = await getPrisma();

		try {
			// Verify user belongs to the organization
			const membership = await client.organization.findFirst({
				where: {
					id: organizationId,
					users: {
						some: {
							id: locals.user!.id
						}
					}
				}
			});

			if (!membership) {
				return fail(400, { error: 'You do not have access to this organization' });
			}

			// Update user's current organization
			await client.user.update({
				where: { id: locals.user!.id },
				data: { organizationId: organizationId }
			});

			throw redirect(303, '/dashboard');
		} catch (error) {
			if (error instanceof Response) {
				throw error; // Re-throw redirects
			}

			console.error('[SELECT ORG] Error:', error);
			return fail(500, { error: 'Failed to switch organizations. Please try again.' });
		}
	}
};