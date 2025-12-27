import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { validateInput, createOrganizationSchema } from '$lib/validation';
import { getPrisma } from '$lib/server/prisma';
import type { ServerLoad } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect if user is not authenticated
	if (!locals.user) {
		throw redirect(303, '/auth/login');
	}

	// Redirect if user already has an organization
	if (locals.authState === 'org_member') {
		throw redirect(303, '/dashboard');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(303, '/auth/login');
		}

		if (locals.authState === 'org_member') {
			throw redirect(303, '/dashboard');
		}

		const formData = await request.formData();
		const isCreate = formData.get('create') === 'true';

		if (isCreate) {
			// Handle organization creation
			const validation = validateInput(createOrganizationSchema, {
				orgName: formData.get('orgName')
			});

			if (!validation.success) {
				const firstError = Object.values(validation.errors)[0];
				return fail(400, {
					error: firstError,
					orgName: formData.get('orgName')
				});
			}

			const client = await getPrisma();

			// Check if org name already exists
			const existingOrg = await client.organization.findUnique({
				where: { name: validation.data.orgName }
			});

			if (existingOrg) {
				return fail(400, {
					error: 'An organization with this name already exists',
					orgName: formData.get('orgName')
				});
			}

			try {
				// Create organization and add user as admin
				await client.$transaction(async (tx) => {
					const org = await tx.organization.create({
						data: { name: validation.data.orgName, updatedAt: new Date() }
					});

					// Update user with org and make them admin
					await tx.user.update({
						where: { id: locals.user!.id },
						data: {
							organizationId: org.id,
							role: 'ADMIN'
						}
					});
				});

				throw redirect(303, '/dashboard');
			} catch (error) {
				console.error('[ONBOARDING] Error creating organization:', error);
				return fail(500, {
					error: 'Failed to create organization. Please try again.',
					orgName: formData.get('orgName')
				});
			}
		}
	}
};