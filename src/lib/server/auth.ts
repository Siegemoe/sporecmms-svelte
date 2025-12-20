import type { Cookies } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { getPrisma } from './prisma';
import { dev } from '$app/environment';

const SESSION_COOKIE = 'spore_session';
const SESSION_EXPIRY_DAYS = 30;

// Password hashing
export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

// Session management
export async function createSession(userId: string): Promise<string> {
	try {
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

		const client = await getPrisma();
		const session = await client.session.create({
			data: {
				userId,
				expiresAt,
				token: crypto.randomUUID()
			}
		});

		return session.id;
	} catch (error) {
		console.error('Failed to create session:', error);
		throw new Error('Failed to create session');
	}
}

export async function validateSession(cookies: Cookies) {
	const sessionId = cookies.get(SESSION_COOKIE);
	if (!sessionId) {
		return null;
	}

	const client = await getPrisma();
	const session = await client.session.findUnique({
		where: { id: sessionId },
		include: {
			user: {
				select: {
					id: true,
					email: true,
					firstName: true,
					lastName: true,
					role: true,
					organizationId: true
				}
			}
		}
	});

	if (!session) {
		return null;
	}

	// Check if session is expired
	if (session.expiresAt < new Date()) {
		await client.session.delete({ where: { id: sessionId } });
		return null;
	}

	return session.user;
}

export async function validateSessionWithOrg(cookies: Cookies) {
	const sessionId = cookies.get(SESSION_COOKIE);
	if (!sessionId) {
		return { user: null, state: 'unauthenticated' };
	}

	const client = await getPrisma();
	const session = await client.session.findUnique({
		where: { id: sessionId },
		include: {
			User: {
				select: {
					id: true,
					email: true,
					firstName: true,
					lastName: true,
					role: true,
					organizationId: true,
					Organization: {
						select: {
							id: true,
							name: true
						}
					}
				}
			}
		}
	});

	if (!session) {
		return { user: null, state: 'unauthenticated' };
	}

	// Check if session is expired
	if (session.expiresAt < new Date()) {
		await client.session.delete({ where: { id: sessionId } });
		return { user: null, state: 'unauthenticated' };
	}

	const user = session.User;

	// Determine authentication state
	if (!user.organizationId) {
		return { user, state: 'lobby' };
	}

	// Get all organizations the user belongs to
	const userOrgs = await client.organization.findMany({
		where: {
			User: {
				some: {
					id: user.id
				}
			}
		},
		select: {
			id: true,
			name: true
		}
	});

	return {
		user,
		state: 'org_member',
		organizations: userOrgs,
		currentOrganization: user.Organization
	};
}

export async function destroySession(cookies: Cookies): Promise<void> {
	const sessionId = cookies.get(SESSION_COOKIE);
	if (sessionId) {
		const client = await getPrisma();
		await client.session.delete({ where: { id: sessionId } }).catch(() => {});
		cookies.delete(SESSION_COOKIE, { path: '/' });
	}
}

export function setSessionCookie(cookies: Cookies, sessionId: string): void {
	cookies.set(SESSION_COOKIE, sessionId, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict', // Upgrade from 'lax' for better security
		secure: !dev, // Always secure in production (Cloudflare Pages enforces HTTPS)
		maxAge: 60 * 60 * 24 * SESSION_EXPIRY_DAYS
	});
}

// Role checks
export function isAdmin(role: string): boolean {
	return role === 'ADMIN';
}

export function isManager(role: string): boolean {
	return role === 'ADMIN' || role === 'MANAGER';
}

export function canManageUsers(role: string): boolean {
	return role === 'ADMIN';
}

export function canManageSites(role: string): boolean {
	return role === 'ADMIN' || role === 'MANAGER';
}

export function canCreateWorkOrders(role: string): boolean {
	return true; // All roles can create work orders
}

export function canDeleteWorkOrders(role: string): boolean {
	return role === 'ADMIN' || role === 'MANAGER';
}

// Password reset functions
export async function validateResetToken(token: string) {
	const client = await getPrisma();

	const user = await client.user.findFirst({
		where: {
			passwordResetToken: token,
			passwordResetExpiresAt: {
				gt: new Date()
			}
		},
		select: {
			id: true,
			email: true
		}
	});

	return user;
}

export async function resetPassword(token: string, newPassword: string) {
	const client = await getPrisma();

	// Validate token first
	const user = await validateResetToken(token);
	if (!user) {
		throw new Error('Invalid or expired reset token');
	}

	// Hash the new password
	const hashedPassword = await hashPassword(newPassword);

	// Update user password and clear reset token
	await client.user.update({
		where: { id: user.id },
		data: {
			password: hashedPassword,
			passwordResetToken: null,
			passwordResetExpiresAt: null
		}
	});

	return user;
}

export async function setRecoveryPassphrase(userId: string, passphrase: string) {
	const client = await getPrisma();

	const hashedPassphrase = await hashPassword(passphrase);

	await client.user.update({
		where: { id: userId },
		data: {
			recoveryPassphrase: hashedPassphrase
		}
	});
}