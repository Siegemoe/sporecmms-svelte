import type { PageServerLoad, Actions } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import { hashPassword, canManageUsers } from '$lib/server/auth';
import { fail, redirect, error } from '@sveltejs/kit';
import { logAudit } from '$lib/server/audit';

export const load: PageServerLoad = async (event) => {
	const { locals } = event;
	
	// Only admins can access users page
	if (!locals.user || !canManageUsers(locals.user.role)) {
		throw error(403, 'Access denied. Admin privileges required.');
	}

	const prisma = createRequestPrisma(event);

	const users = await prisma.user.findMany({
		where: { orgId: locals.user.orgId },
		orderBy: { createdAt: 'desc' },
		select: {
			id: true,
			email: true,
			firstName: true,
			lastName: true,
			role: true,
			createdAt: true
		}
	});

	return { users };
};

export const actions: Actions = {
	create: async (event) => {
		const { locals, request } = event;
		
		if (!locals.user || !canManageUsers(locals.user.role)) {
			return fail(403, { error: 'Access denied' });
		}

		const prisma = createRequestPrisma(event);
		const formData = await request.formData();
		
		const email = formData.get('email') as string;
		const firstName = formData.get('firstName') as string;
		const lastName = formData.get('lastName') as string;
		const role = formData.get('role') as string;
		const password = formData.get('password') as string;

		if (!email?.trim()) {
			return fail(400, { error: 'Email is required' });
		}
		if (!password || password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters' });
		}
		if (!['ADMIN', 'MANAGER', 'TECHNICIAN'].includes(role)) {
			return fail(400, { error: 'Invalid role' });
		}

		// Check if email exists
		const existing = await prisma.user.findUnique({
			where: { email: email.toLowerCase().trim() }
		});
		if (existing) {
			return fail(400, { error: 'Email already in use' });
		}

		const hashedPassword = await hashPassword(password);

		const newUser = await prisma.user.create({
			data: {
				email: email.toLowerCase().trim(),
				password: hashedPassword,
				firstName: firstName?.trim() || null,
				lastName: lastName?.trim() || null,
				role: role as 'ADMIN' | 'MANAGER' | 'TECHNICIAN',
				orgId: locals.user.orgId
			}
		});

		await logAudit(locals.user.id, 'USER_CREATED', {
			newUserId: newUser.id,
			email: newUser.email,
			role
		});

		return { success: true };
	},

	updateRole: async (event) => {
		const { locals, request } = event;
		
		if (!locals.user || !canManageUsers(locals.user.role)) {
			return fail(403, { error: 'Access denied' });
		}

		const prisma = createRequestPrisma(event);
		const formData = await request.formData();
		
		const userId = formData.get('userId') as string;
		const role = formData.get('role') as string;

		if (!userId) return fail(400, { error: 'User ID required' });
		if (!['ADMIN', 'MANAGER', 'TECHNICIAN'].includes(role)) {
			return fail(400, { error: 'Invalid role' });
		}

		// Can't change own role
		if (userId === locals.user.id) {
			return fail(400, { error: "Can't change your own role" });
		}

		// Get user's current role for audit
		const targetUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { email: true, role: true }
		});

		await prisma.user.update({
			where: { id: userId, orgId: locals.user.orgId },
			data: { role: role as 'ADMIN' | 'MANAGER' | 'TECHNICIAN' }
		});

		await logAudit(locals.user.id, 'USER_ROLE_CHANGED', {
			targetUserId: userId,
			email: targetUser?.email,
			oldRole: targetUser?.role,
			newRole: role
		});

		return { success: true };
	},

	delete: async (event) => {
		const { locals, request } = event;
		
		if (!locals.user || !canManageUsers(locals.user.role)) {
			return fail(403, { error: 'Access denied' });
		}

		const prisma = createRequestPrisma(event);
		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		if (!userId) return fail(400, { error: 'User ID required' });

		// Can't delete yourself
		if (userId === locals.user.id) {
			return fail(400, { error: "Can't delete your own account" });
		}

		// Get user details before deletion for audit
		const targetUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { email: true }
		});

		await prisma.user.delete({
			where: { id: userId, orgId: locals.user.orgId }
		});

		await logAudit(locals.user.id, 'USER_DELETED', {
			deletedUserId: userId,
			email: targetUser?.email
		});

		return { success: true };
	}
};
