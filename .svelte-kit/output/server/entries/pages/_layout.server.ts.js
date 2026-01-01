import { g as getPrisma } from "../../chunks/prisma.js";
import { q as queryTemplates } from "../../chunks/templates.js";
const load = async ({ locals }) => {
  let assets = [];
  let buildings = [];
  let rooms = [];
  let templates = [];
  if (locals.user && locals.authState === "org_member") {
    const prisma = await getPrisma();
    assets = await prisma.asset.findMany({
      where: {
        Unit: {
          Site: {
            organizationId: locals.user.organizationId ?? void 0
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
        name: "asc"
      },
      take: 35
      // Limit to keep it performant
    });
    buildings = await prisma.building.findMany({
      where: {
        Site: {
          organizationId: locals.user.organizationId ?? void 0
        }
      },
      include: {
        Site: true
      },
      orderBy: {
        name: "asc"
      },
      take: 35
      // Limit to keep it performant
    });
    rooms = await prisma.unit.findMany({
      where: {
        Site: {
          organizationId: locals.user.organizationId ?? void 0
        }
      },
      include: {
        Building: true,
        Site: true
      },
      orderBy: {
        roomNumber: "asc"
      },
      take: 35
      // Limit to keep it performant
    });
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
    assets: assets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      room: asset.Unit ? {
        id: asset.Unit.id,
        name: asset.Unit.name || asset.Unit.roomNumber,
        building: asset.Unit.Building,
        site: asset.Unit.Site ? {
          name: asset.Unit.Site.name
        } : void 0
      } : void 0
    })),
    buildings: buildings.map((building) => ({
      id: building.id,
      name: building.name,
      site: building.Site ? {
        name: building.Site.name
      } : void 0
    })),
    rooms: rooms.map((unit) => ({
      id: unit.id,
      name: unit.name || unit.roomNumber,
      building: unit.Building,
      site: unit.Site ? {
        name: unit.Site.name
      } : void 0
    })),
    templates
  };
};
export {
  load
};
