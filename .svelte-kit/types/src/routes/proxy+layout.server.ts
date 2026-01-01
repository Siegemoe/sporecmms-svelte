// @ts-nocheck
import type { LayoutServerLoad } from './$types';
import { getPrisma } from '$lib/server/prisma';
import type { Asset, Building, Unit } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { queryTemplates } from '$lib/server/work-orders/templates';

// Types with relations included
type AssetWithUnit = Prisma.AssetGetPayload<{
	include: { Unit: { include: { Building: true; Site: { select: { name: true } } } } };
}>;
type BuildingWithSite = Prisma.BuildingGetPayload<{ include: { Site: true } }>;
type UnitWithBuildingAndSite = Prisma.UnitGetPayload<{ include: { Building: true; Site: true } }>;

export const load = async ({ locals }: Parameters<LayoutServerLoad>[0]) => {
	// Get data for Quick FAB if user is authenticated and has organization
	let assets: AssetWithUnit[] = [];
	let buildings: BuildingWithSite[] = [];
	let rooms: UnitWithBuildingAndSite[] = [];
	let templates: any[] = [];

	if (locals.user && locals.authState === 'org_member') {
		const prisma = await getPrisma();

		// Get assets
		assets = await prisma.asset.findMany({
			where: {
				Unit: {
					Site: {
						organizationId: locals.user.organizationId ?? undefined
					}
				}
			},
			include: {
				Unit: {
					include: {
						Building: true,
						Site: { select: { name: true } }
					}
				}
			},
			orderBy: {
				name: 'asc'
			},
			take: 35 // Limit to keep it performant
		});

		// Get buildings
		buildings = await prisma.building.findMany({
			where: {
				Site: {
					organizationId: locals.user.organizationId ?? undefined
				}
			},
			include: {
				Site: true
			},
			orderBy: {
				name: 'asc'
			},
			take: 35 // Limit to keep it performant
		});

		// Get rooms (units)
		rooms = await prisma.unit.findMany({
			where: {
				Site: {
					organizationId: locals.user.organizationId ?? undefined
				}
			},
			include: {
				Building: true,
				Site: true
			},
			orderBy: {
				roomNumber: 'asc'
			},
			take: 35 // Limit to keep it performant
		});

		// Get active templates for the organization
		templates = await queryTemplates(prisma, {
			organizationId: locals.user.organizationId,
			isActive: true
		});
	}

	return {
		user: locals.user ?? null,
		authState: locals.authState,
		organizations: locals.organizations,
		currentOrganization: locals.currentOrganization,
		assets: assets.map(asset => ({
			id: asset.id,
			name: asset.name,
			room: asset.Unit ? {
				id: asset.Unit.id,
				name: asset.Unit.name || asset.Unit.roomNumber,
				building: asset.Unit.Building,
				site: asset.Unit.Site ? {
					name: asset.Unit.Site.name
				} : undefined
			} : undefined
		})),
		buildings: buildings.map(building => ({
			id: building.id,
			name: building.name,
			site: building.Site ? {
				name: building.Site.name
			} : undefined
		})),
		rooms: rooms.map(unit => ({
			id: unit.id,
			name: unit.name || unit.roomNumber,
			building: unit.Building,
			site: unit.Site ? {
				name: unit.Site.name
			} : undefined
		})),
		templates
	};
};
