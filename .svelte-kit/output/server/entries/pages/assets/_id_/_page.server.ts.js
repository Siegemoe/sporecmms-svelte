import { c as createRequestPrisma } from "../../../../chunks/prisma.js";
import { e as error, f as fail, r as redirect } from "../../../../chunks/index.js";
import { r as requireAuth, i as isManagerOrAbove } from "../../../../chunks/guards.js";
const load = async (event) => {
  requireAuth(event);
  const prisma = await createRequestPrisma(event);
  const { id } = event.params;
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      room: {
        include: {
          site: { select: { id: true, name: true } }
        }
      },
      workOrders: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          title: true,
          status: true,
          failureMode: true,
          createdAt: true,
          updatedAt: true
        }
      },
      _count: {
        select: { workOrders: true }
      }
    }
  });
  if (!asset) {
    throw error(404, "Asset not found");
  }
  const rooms = await prisma.room.findMany({
    orderBy: [
      { site: { name: "asc" } },
      { building: "asc" },
      { name: "asc" }
    ],
    include: {
      site: { select: { name: true } }
    }
  });
  const [totalWO, pendingWO, inProgressWO, completedWO] = await Promise.all([
    prisma.workOrder.count({ where: { assetId: id } }),
    prisma.workOrder.count({ where: { assetId: id, status: "PENDING" } }),
    prisma.workOrder.count({ where: { assetId: id, status: "IN_PROGRESS" } }),
    prisma.workOrder.count({ where: { assetId: id, status: "COMPLETED" } })
  ]);
  return {
    asset,
    rooms,
    woStats: { total: totalWO, pending: pendingWO, inProgress: inProgressWO, completed: completedWO }
  };
};
const actions = {
  update: async (event) => {
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const { id } = event.params;
    const name = formData.get("name");
    const roomId = formData.get("roomId");
    if (!name || name.trim() === "") {
      return fail(400, { error: "Asset name is required" });
    }
    if (!roomId) {
      return fail(400, { error: "Room is required" });
    }
    const asset = await prisma.asset.update({
      where: { id },
      data: {
        name: name.trim(),
        roomId
      }
    });
    return { success: true, asset };
  },
  delete: async (event) => {
    if (!isManagerOrAbove(event)) {
      return fail(403, { error: "Permission denied. Only managers can delete assets." });
    }
    const prisma = await createRequestPrisma(event);
    const { id } = event.params;
    await prisma.asset.delete({
      where: { id }
    });
    throw redirect(303, "/assets");
  }
};
export {
  actions,
  load
};
