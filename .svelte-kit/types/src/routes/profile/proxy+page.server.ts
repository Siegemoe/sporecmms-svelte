// @ts-nocheck
import type { PageServerLoad, Actions } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import { hashPassword, verifyPassword } from '$lib/server/auth';
import { requireAuth } from '$lib/server/guards';
import { fail } from '@sveltejs/kit';

export const load = async (event: Parameters<PageServerLoad>[0]) => {
	requireAuth(event);
	
	const prisma = createRequestPrisma(event);
	const userId = event.locals.user!.id;

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			email: true,
			firstName: true,
			lastName: true,
			phoneNumber: true,
			role: true,
			createdAt: true
		}
	});

	return { profile: user };
};

export const actions = {
	updateProfile: async (event: import('./$types').RequestEvent) => {
		requireAuth(event);
		
		const prisma = createRequestPrisma(event);
		const userId = event.locals.user!.id;
		const formData = await event.request.formData();
		
		const firstName = formData.get('firstName') as string;
		const lastName = formData.get('lastName') as string;
		const phoneNumber = formData.get('phoneNumber') as string;

		await prisma.user.update({
			where: { id: userId },
			data: {
				firstName: firstName?.trim() || null,
				lastName: lastName?.trim() || null,
				phoneNumber: phoneNumber?.trim() || null
			}
		});

		return { success: true, message: 'Profile updated successfully' };
	},

	changePassword: async (event: import('./$types').RequestEvent) => {
		requireAuth(event);
		
		const prisma = createRequestPrisma(event);
		const userId = event.locals.user!.id;
		const formData = await event.request.formData();
		
		const currentPassword = formData.get('currentPassword') as string;
		const newPassword = formData.get('newPassword') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		if (!currentPassword || !newPassword || !confirmPassword) {
			return fail(400, { passwordError: 'All password fields are required' });
		}

		if (newPassword.length < 8) {
			return fail(400, { passwordError: 'New password must be at least 8 characters' });
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { passwordError: 'New passwords do not match' });
		}

		// Get current user with password
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { password: true }
		});

		if (!user) {
			return fail(400, { passwordError: 'User not found' });
		}

		// Verify current password
		const isValid = await verifyPassword(currentPassword, user.password);
		if (!isValid) {
			return fail(400, { passwordError: 'Current password is incorrect' });
		}

		// Hash and save new password
		const hashedPassword = await hashPassword(newPassword);
		await prisma.user.update({
			where: { id: userId },
			data: { password: hashedPassword }
		});

		return { passwordSuccess: true, message: 'Password changed successfully' };
	}
};
;null as any as Actions;