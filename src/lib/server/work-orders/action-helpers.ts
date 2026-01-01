import type { RequestEvent } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/guards';
import { createRequestPrisma } from '$lib/server/prisma';
import type { RequestPrisma } from '$lib/types/prisma';

/**
 * Context object returned by getActionContext
 * Contains the commonly used values for work order actions
 */
export interface ActionContext {
	prisma: RequestPrisma;
	userId: string;
	organizationId: string | null;
}

/**
 * Helper function to get common action context
 * Performs authentication and initializes prisma client
 *
 * Usage in actions:
 * ```ts
 * export const actions = {
 *   myAction: async (event) => {
 *     const { prisma, userId, organizationId } = await getActionContext(event);
 *     // ... action logic
 *   }
 * };
 * ```
 */
export async function getActionContext(event: RequestEvent): Promise<ActionContext> {
	requireAuth(event);
	const prisma = await createRequestPrisma(event);
	const userId = event.locals.user!.id;
	const organizationId = event.locals.user!.organizationId;
	return { prisma, userId, organizationId };
}
