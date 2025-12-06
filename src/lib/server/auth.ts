import type { Cookies } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

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

		const session = await prisma.session.create({
			data: {
				userId,
				expiresAt
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

	const session = await prisma.session.findUnique({
		where: { id: sessionId },
		include: {
			user: {
				select: {
					id: true,
					email: true,
					firstName: true,
					lastName: true,
					role: true,
					orgId: true
				}
			}
		}
	});

	if (!session) {
		return null;
	}

	// Check if session is expired
	if (session.expiresAt < new Date()) {
		await prisma.session.delete({ where: { id: sessionId } });
		return null;
	}

	return session.user;
}

export async function destroySession(cookies: Cookies): Promise<void> {
	const sessionId = cookies.get(SESSION_COOKIE);
	if (sessionId) {
		await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
		cookies.delete(SESSION_COOKIE, { path: '/' });
	}
}

export function setSessionCookie(cookies: Cookies, sessionId: string): void {
	cookies.set(SESSION_COOKIE, sessionId, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
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
