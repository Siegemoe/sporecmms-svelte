import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

type UserRole = 'ADMIN' | 'MANAGER' | 'TECHNICIAN';

/**
 * Require authentication - redirects to login if not authenticated
 */
export function requireAuth(event: RequestEvent): void {
	if (!event.locals.user) {
		throw redirect(303, '/auth/login');
	}
}

/**
 * Require specific role(s) - throws 403 if user doesn't have required role
 */
export function requireRole(event: RequestEvent, allowedRoles: UserRole[]): void {
	requireAuth(event);
	
	const userRole = event.locals.user!.role;
	if (!allowedRoles.includes(userRole)) {
		throw redirect(303, '/dashboard?error=unauthorized');
	}
}

/**
 * Check if user has admin role
 */
export function isAdmin(event: RequestEvent): boolean {
	return event.locals.user?.role === 'ADMIN';
}

/**
 * Check if user has manager or admin role
 */
export function isManagerOrAbove(event: RequestEvent): boolean {
	const role = event.locals.user?.role;
	return role === 'ADMIN' || role === 'MANAGER';
}

/**
 * Role hierarchy check - can this role manage that role?
 */
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
	const hierarchy: Record<UserRole, number> = {
		'ADMIN': 3,
		'MANAGER': 2,
		'TECHNICIAN': 1
	};
	return hierarchy[managerRole] > hierarchy[targetRole];
}
