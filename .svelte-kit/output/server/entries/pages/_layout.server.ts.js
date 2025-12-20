import { c as createRequestPrisma } from "../../chunks/prisma.js";
const load = async ({ locals }) => {
  let assets = [];
  let buildings = [];
  let rooms = [];
  if (locals.user && locals.authState === "org_member") {
    const prisma = await createRequestPrisma({ locals });
    assets = await prisma.asset.findMany({
      where: {
        unit: {
          site: {
            organizationId: locals.user.organizationId ?? void 0
          }
        }
      },
      include: {
        unit: {
          include: {
            building: true,
            site: { select: { name: true } }
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
        site: {
          organizationId: locals.user.organizationId ?? void 0
        }
      },
      include: {
        site: true
      },
      orderBy: {
        name: "asc"
      },
      take: 35
      // Limit to keep it performant
    });
    rooms = await prisma.unit.findMany({
      where: {
        site: {
          organizationId: locals.user.organizationId ?? void 0
        }
      },
      include: {
        building: true,
        site: true
      },
      orderBy: {
        roomNumber: "asc"
      },
      take: 35
      // Limit to keep it performant
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
      room: asset.unit ? {
        id: asset.unit.id,
        name: asset.unit.name || asset.unit.roomNumber,
        building: asset.unit.building,
        site: asset.unit.site ? {
          name: asset.unit.site.name
        } : void 0
      } : void 0
    })),
    buildings: buildings.map((building) => ({
      id: building.id,
      name: building.name,
      site: building.site ? {
        name: building.site.name
      } : void 0
    })),
    rooms: rooms.map((unit) => ({
      id: unit.id,
      name: unit.name || unit.roomNumber,
      building: unit.building,
      site: unit.site ? {
        name: unit.site.name
      } : void 0
    }))
  };
};
export {
  load
};
