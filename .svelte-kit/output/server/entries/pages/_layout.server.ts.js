import { c as createRequestPrisma } from "../../chunks/prisma.js";
const load = async ({ locals }) => {
  let assets = [];
  let buildings = [];
  let rooms = [];
  if (locals.user) {
    const prisma = await createRequestPrisma({ locals });
    assets = await prisma.asset.findMany({
      include: {
        room: {
          include: {
            building: {
              select: {
                id: true,
                name: true
              }
            },
            site: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        name: "asc"
      },
      take: 50
      // Limit to keep it performant
    });
    buildings = await prisma.building.findMany({
      include: {
        site: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: "asc"
      }
    });
    rooms = await prisma.room.findMany({
      include: {
        building: {
          select: {
            id: true,
            name: true
          }
        },
        site: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: "asc"
      }
    });
  }
  return {
    user: locals.user ?? null,
    assets: assets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      room: asset.room ? {
        id: asset.room.id,
        name: asset.room.name,
        building: asset.room.building,
        site: asset.room.site ? {
          name: asset.room.site.name
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
    rooms: rooms.map((room) => ({
      id: room.id,
      name: room.name,
      building: room.building,
      site: room.site ? {
        name: room.site.name
      } : void 0
    }))
  };
};
export {
  load
};
