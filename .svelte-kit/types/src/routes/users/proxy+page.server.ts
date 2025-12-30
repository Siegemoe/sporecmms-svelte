// @ts-nocheck
import type { PageServerLoad, Actions } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import { hashPassword, canManageUsers } from '$lib/server/auth';
import { fail, redirect, error } from '@sveltejs/kit';
import { logAudit } from '$lib/server/audit';

export const load = async (event: Parameters<PageServerLoad>[0]) => {
	const { locals, url } = event;

	// Only admins can access users page
	if (!locals.user || !canManageUsers(locals.user.role)) {
		throw error(403, 'Access denied. Admin privileges required.');
	}

	const prisma = await createRequestPrisma(event);
	const organizationId = locals.user.organizationId!;

	// Parse filter and sort parameters
	const search = url.searchParams.get('search')?.trim();
	const roleFilter = url.searchParams.get('role');
	const statusFilter = url.searchParams.get('status');
	const sort = url.searchParams.get('sort') || 'name';

	// Build where clause
	const where: any = { organizationId };

	if (roleFilter) {
		where.role = roleFilter;
	}

	if (statusFilter === 'active') {
		where.isActive = true;
	} else if (statusFilter === 'inactive') {
		where.isActive = false;
	}

	// Fuzzy search on name and email
	if (search) {
		where.OR = [
			{ email: { contains: search, mode: 'insensitive' } },
			{ firstName: { contains: search, mode: 'insensitive' } },
			{ lastName: { contains: search, mode: 'insensitive' } }
		];
	}

	// Build orderBy based on sort option
	let orderBy: any = {};
	switch (sort) {
		case 'name':
			orderBy = [{ firstName: 'asc' as const }, { lastName: 'asc' as const }];
			break;
		case 'email':
			orderBy = { email: 'asc' };
			break;
		case 'role':
			orderBy = { role: 'asc' };
			break;
		case 'joined':
			orderBy = { createdAt: 'desc' };
			break;
		case 'updated':
			orderBy = { updatedAt: 'desc' };
			break;
		default:
			orderBy = [{ firstName: 'asc' }, { lastName: 'asc' }];
	}

	const users = await prisma.user.findMany({
		where,
		orderBy,
		select: {
			id: true,
			email: true,
			firstName: true,
			lastName: true,
			role: true,
			isActive: true,
			createdAt: true,
			updatedAt: true
		}
	});

	return { users };
};

export const actions = {
	create: async (event: import('./$types').RequestEvent) => {
		const { locals, request } = event;
		
		if (!locals.user || !canManageUsers(locals.user.role)) {
			return fail(403, { error: 'Access denied' });
		}

		const prisma = await createRequestPrisma(event);
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
				organizationId: locals.user.organizationId!,
				updatedAt: new Date()
			}
		});

		await logAudit(locals.user.id, 'USER_CREATED', {
			newUserId: newUser.id,
			email: newUser.email,
			role
		});

		return { success: true };
	},

	updateRole: async (event: import('./$types').RequestEvent) => {
		const { locals, request } = event;
		
		if (!locals.user || !canManageUsers(locals.user.role)) {
			return fail(403, { error: 'Access denied' });
		}

		const prisma = await createRequestPrisma(event);
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

		await prisma.user.updateMany({
			where: { id: userId, organizationId: locals.user.organizationId! },
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

	delete: async (event: import('./$types').RequestEvent) => {
		const { locals, request } = event;
		
		if (!locals.user || !canManageUsers(locals.user.role)) {
			return fail(403, { error: 'Access denied' });
		}

		const prisma = await createRequestPrisma(event);
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

		await prisma.user.deleteMany({
			where: { id: userId, organizationId: locals.user.organizationId! }
		});

		await logAudit(locals.user.id, 'USER_DELETED', {
			deletedUserId: userId,
			email: targetUser?.email
		});

		return { success: true };
	}
};;null as any as Actions;