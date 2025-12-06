import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import type { RequestEvent } from '@sveltejs/kit';

// Singleton instance
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prismaSingleton = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
}).$extends(withAccelerate());

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prismaSingleton;
} else {
  globalForPrisma.prisma = prismaSingleton;
}

// Models that have direct orgId field and need tenant filtering
// Note: Asset and Room don't have orgId - they inherit through Site
const orgModels = ['WorkOrder', 'User', 'Site'];

/**
 * Creates a Prisma client that automatically filters by orgId
 * This ensures tenant isolation - users can only see their org's data
 */
function createPrismaClient(orgId?: string) {
	if (!orgId) {
		// No org context - return base client (for system operations)
		return prismaSingleton;
	}

	return prismaSingleton.$extends({
		query: {
			$allModels: {
				async findMany({ model, args, query }) {
					if (orgModels.includes(model)) {
						args.where = { ...args.where, orgId };
					}
					return query(args);
				},
				async findFirst({ model, args, query }) {
					if (orgModels.includes(model)) {
						args.where = { ...args.where, orgId };
					}
					return query(args);
				},
				async findUnique({ model, args, query }) {
					// findUnique can't add orgId to where, but we verify after
					const result = await query(args);
					if (result && orgModels.includes(model) && (result as any).orgId !== orgId) {
						return null; // Deny access to other orgs
					}
					return result;
				},
				async update({ model, args, query }) {
					if (orgModels.includes(model)) {
						args.where = { ...args.where, orgId } as any;
					}
					return query(args);
				},
				async delete({ model, args, query }) {
					if (orgModels.includes(model)) {
						args.where = { ...args.where, orgId } as any;
					}
					return query(args);
				},
				async create({ model, args, query }) {
					// Auto-inject orgId on create
					if (orgModels.includes(model)) {
						args.data = { ...args.data, orgId };
					}
					return query(args);
				}
			}
		}
	});
}

export function createRequestPrisma(event: RequestEvent) {
	const orgId = event.locals.user?.orgId;
	return createPrismaClient(orgId);
}

// Default prisma instance for system operations
export const prisma = prismaSingleton;
