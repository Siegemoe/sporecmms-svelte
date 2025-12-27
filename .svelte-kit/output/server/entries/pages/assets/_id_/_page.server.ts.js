import { c as createRequestPrisma } from "../../../../chunks/prisma.js";
import { e as error, f as fail, r as redirect } from "../../../../chunks/index.js";
import { r as requireAuth, i as isManagerOrAbove } from "../../../../chunks/guards.js";
const load = async (event) => {
  requireAuth(event);
  const prisma = await createRequestPrisma(event);
  const { id } = event.params;
  const organizationId = event.locals.user.organizationId;
  const asset = await prisma.asset.findFirst({
    where: {
      id,
      Unit: {
        Site: {
          organizationId: organizationId ?? void 0
        }
      }
    },
    include: {
      Unit: {
        include: {
          Site: { select: { id: true, name: true } },
          Building: { select: { id: true, name: true } }
        }
      },
      WorkOrder: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          title: true,
          status: true,
          // failureMode: true, // Removed: Field does not exist in WorkOrder schema
          createdAt: true,
          updatedAt: true
        }
      },
      _count: {
        select: { WorkOrder: true }
      }
    }
  });
  if (!asset) {
    throw error(404, "Asset not found");
  }
  const units = await prisma.unit.findMany({
    where: {
      Site: {
        organizationId: organizationId ?? void 0
      }
    },
    orderBy: [
      { Site: { name: "asc" } },
      { Building: { name: "asc" } },
      { roomNumber: "asc" }
    ],
    take: 50,
    include: {
      Site: { select: { name: true } },
      Building: { select: { name: true } }
    }
  });
  const assetWithRoom = {
    ...asset,
    room: asset.Unit ? {
      ...asset.Unit,
      name: asset.Unit.name || asset.Unit.roomNumber
    } : null,
    Unit: void 0
    // Optional: remove unit if we want to be strict, but keeping it is fine
  };
  const rooms = units.map((unit) => ({
    ...unit,
    name: unit.name || unit.roomNumber
  }));
  const [totalWO, pendingWO, inProgressWO, completedWO] = await Promise.all([
    prisma.workOrder.count({ where: { assetId: id } }),
    prisma.workOrder.count({ where: { assetId: id, status: "PENDING" } }),
    prisma.workOrder.count({ where: { assetId: id, status: "IN_PROGRESS" } }),
    prisma.workOrder.count({ where: { assetId: id, status: "COMPLETED" } })
  ]);
  return {
    asset: assetWithRoom,
    rooms,
    woStats: { total: totalWO, pending: pendingWO, inProgress: inProgressWO, completed: completedWO }
  };
};
const actions = {
  update: async (event) => {
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const { id } = event.params;
    const organizationId = event.locals.user.organizationId;
    const name = formData.get("name");
    const roomId = formData.get("roomId");
    if (!name || name.trim() === "") {
      return fail(400, { error: "Asset name is required" });
    }
    if (!roomId) {
      return fail(400, { error: "Room is required" });
    }
    const existingAsset = await prisma.asset.findFirst({
      where: {
        id,
        Unit: {
          Site: {
            organizationId: organizationId ?? void 0
          }
        }
      }
    });
    if (!existingAsset) {
      return fail(404, { error: "Asset not found" });
    }
    const unit = await prisma.unit.findFirst({
      where: {
        id: roomId,
        Site: {
          organizationId: organizationId ?? void 0
        }
      }
    });
    if (!unit) {
      return fail(404, { error: "Room not found" });
    }
    const asset = await prisma.asset.update({
      where: { id },
      data: {
        name: name.trim(),
        unitId: roomId
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
    const organizationId = event.locals.user.organizationId;
    const asset = await prisma.asset.findFirst({
      where: {
        id,
        Unit: {
          Site: {
            organizationId: organizationId ?? void 0
          }
        }
      }
    });
    if (!asset) {
      return fail(404, { error: "Asset not found" });
    }
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
