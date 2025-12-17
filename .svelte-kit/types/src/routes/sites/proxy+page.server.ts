// @ts-nocheck
import type { PageServerLoad, Actions } from './$types';
import { createRequestPrisma } from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';
import { requireAuth, isManagerOrAbove } from '$lib/server/guards';
import { logAudit } from '$lib/server/audit';

export const load = async (event: Parameters<PageServerLoad>[0]) => {
	requireAuth(event);
	
	const prisma = await createRequestPrisma(event);

	const sites = await prisma.site.findMany({
		orderBy: { createdAt: 'desc' },
		include: {
			_count: {
				select: {
					units: true,
					buildings: true,
					assets: true
				}
			},
			units: {
				include: {
					_count: {
						select: { assets: true }
					}
				}
			},
			buildings: {
				include: {
					_count: {
						select: { units: true }
					}
				}
			}
		}
	});

	return { sites };
};

export const actions = {
	create: async (event: import('./$types').RequestEvent) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		
		const name = formData.get('name') as string;
		
		if (!name || name.trim() === '') {
			return fail(400, { error: 'Site name is required' });
		}

		const site = await prisma.site.create({
			data: {
				name: name.trim(),
				orgId: event.locals.user!.orgId
			}
		});

		await logAudit(event.locals.user!.id, 'SITE_CREATED', {
			siteId: site.id,
			name: site.name
		});

		return { success: true, site };
	},

	delete: async (event: import('./$types').RequestEvent) => {
		// Only Admin/Manager can delete sites
		if (!isManagerOrAbove(event)) {
			return fail(403, { error: 'Permission denied. Only managers can delete sites.' });
		}
		
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		
		const siteId = formData.get('siteId') as string;
		
		if (!siteId) {
			return fail(400, { error: 'Site ID is required' });
		}

		// Get site details before deletion for audit
		const site = await prisma.site.findUnique({
			where: { id: siteId },
			select: { name: true }
		});

		await prisma.site.delete({
			where: { id: siteId }
		});

		await logAudit(event.locals.user!.id, 'SITE_DELETED', {
			siteId,
			name: site?.name
		});

		return { success: true };
	},

	update: async (event: import('./$types').RequestEvent) => {
		const prisma = await createRequestPrisma(event);
		const formData = await event.request.formData();
		
		const siteId = formData.get('siteId') as string;
		const name = formData.get('name') as string;
		
		if (!siteId) {
			return fail(400, { error: 'Site ID is required' });
		}
		
		if (!name || name.trim() === '') {
			return fail(400, { error: 'Site name is required' });
		}

		const site = await prisma.site.update({
			where: { id: siteId },
			data: { name: name.trim() }
		});

		return { success: true, site };
	}
};
;null as any as Actions;