import { c as createRequestPrisma } from "../../../../chunks/prisma.js";
import { e as error, f as fail } from "../../../../chunks/index.js";
import { r as requireAuth } from "../../../../chunks/guards.js";
const load = async (event) => {
  requireAuth(event);
  const prisma = createRequestPrisma(event);
  const { id } = event.params;
  const site = await prisma.site.findUnique({
    where: { id },
    include: {
      rooms: {
        orderBy: [
          { building: "asc" },
          { floor: "asc" },
          { name: "asc" }
        ],
        include: {
          _count: {
            select: { assets: true }
          }
        }
      }
    }
  });
  if (!site) {
    throw error(404, "Site not found");
  }
  const roomsByBuilding = site.rooms.reduce((acc, room) => {
    const building = room.building || "Unassigned";
    if (!acc[building]) {
      acc[building] = [];
    }
    acc[building].push(room);
    return acc;
  }, {});
  return { site, roomsByBuilding };
};
const actions = {
  createRoom: async (event) => {
    const prisma = createRequestPrisma(event);
    const formData = await event.request.formData();
    const { id: siteId } = event.params;
    const name = formData.get("name");
    const building = formData.get("building");
    const floor = formData.get("floor");
    if (!name || name.trim() === "") {
      return fail(400, { error: "Room name is required" });
    }
    const room = await prisma.room.create({
      data: {
        name: name.trim(),
        building: building?.trim() || null,
        floor: floor ? parseInt(floor) : null,
        siteId
      }
    });
    return { success: true, room };
  },
  updateSite: async (event) => {
    const prisma = createRequestPrisma(event);
    const formData = await event.request.formData();
    const { id } = event.params;
    const name = formData.get("name");
    if (!name || name.trim() === "") {
      return fail(400, { error: "Site name is required" });
    }
    const site = await prisma.site.update({
      where: { id },
      data: { name: name.trim() }
    });
    return { success: true, site };
  },
  deleteRoom: async (event) => {
    const prisma = createRequestPrisma(event);
    const formData = await event.request.formData();
    const roomId = formData.get("roomId");
    if (!roomId) {
      return fail(400, { error: "Room ID is required" });
    }
    await prisma.room.delete({
      where: { id: roomId }
    });
    return { success: true };
  },
  updateRoom: async (event) => {
    const prisma = createRequestPrisma(event);
    const formData = await event.request.formData();
    const roomId = formData.get("roomId");
    const name = formData.get("name");
    const building = formData.get("building");
    const floor = formData.get("floor");
    if (!roomId) {
      return fail(400, { error: "Room ID is required" });
    }
    if (!name || name.trim() === "") {
      return fail(400, { error: "Room name is required" });
    }
    const room = await prisma.room.update({
      where: { id: roomId },
      data: {
        name: name.trim(),
        building: building?.trim() || null,
        floor: floor ? parseInt(floor) : null
      }
    });
    return { success: true, room };
  }
};
export {
  actions,
  load
};
