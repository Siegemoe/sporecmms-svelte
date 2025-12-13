import { c as createRequestPrisma } from "../../chunks/prisma.js";
const load = async ({ locals }) => {
  let assets = [];
  if (locals.user) {
    const prisma = await createRequestPrisma({ locals });
    assets = await prisma.asset.findMany({
      include: {
        room: {
          include: {
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
  }
  return {
    user: locals.user ?? null,
    assets: assets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      room: asset.room ? {
        site: asset.room.site ? {
          name: asset.room.site.name
        } : void 0
      } : void 0
    }))
  };
};
export {
  load
};
