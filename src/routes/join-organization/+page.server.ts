import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { validateInput, joinOrganizationSchema } from '$lib/validation';
import { getPrisma } from '$lib/server/prisma';

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

		// Validate invite token
		const validation = validateInput(joinOrganizationSchema, {
			inviteToken: formData.get('inviteToken')
		});

		if (!validation.success) {
			const firstError = Object.values(validation.errors)[0];
			return fail(400, {
				error: firstError,
				inviteToken: formData.get('inviteToken')
			});
		}

		const client = await getPrisma();

		try {
			// Find the invite
			const invite = await client.organizationInvite.findUnique({
				where: { token: validation.data.inviteToken },
				include: {
					organization: {
						select: {
							id: true,
							name: true
						}
					}
				}
			});

			if (!invite) {
				return fail(400, {
					error: 'Invalid invite code',
					inviteToken: formData.get('inviteToken')
				});
			}

			// Check if invite has expired
			if (invite.expiresAt < new Date()) {
				return fail(400, {
					error: 'This invite has expired',
					inviteToken: formData.get('inviteToken')
				});
			}

			// Check if invite is still pending
			if (invite.status !== 'PENDING') {
				return fail(400, {
					error: 'This invite has already been used',
					inviteToken: formData.get('inviteToken')
				});
			}

			// Check if email matches the invite
			if (invite.email !== locals.user.email) {
				return fail(400, {
					error: 'This invite was sent to a different email address',
					inviteToken: formData.get('inviteToken')
				});
			}

			// Update invite status and add user to organization
			await client.$transaction(async (tx) => {
				// Mark invite as accepted
				await tx.organizationInvite.update({
					where: { id: invite.id },
					data: { status: 'ACCEPTED' }
				});

				// Add user to organization as a technician by default
				await tx.user.update({
					where: { id: locals.user!.id },
					data: {
						organizationId: invite.organizationId,
						role: 'TECHNICIAN'
					}
				});
			});

			// Return success message with organization name
			return {
				success: `Successfully joined ${invite.organization.name}! Redirecting to dashboard...`,
				organization: invite.organization.name,
				redirect: true
			};
		} catch (error) {
			console.error('[JOIN ORG] Error:', error);
			return fail(500, {
				error: 'Failed to join organization. Please try again.',
				inviteToken: formData.get('inviteToken')
			});
		}
	}
};