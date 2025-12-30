import { c as createRequestPrisma } from "../../../../chunks/prisma.js";
import { e as error, f as fail, r as redirect } from "../../../../chunks/index.js";
import { r as requireAuth, i as isManagerOrAbove } from "../../../../chunks/guards.js";
import { a as assetSchema } from "../../../../chunks/validation.js";
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
    include: {
      Site: { select: { name: true } },
      Building: { select: { name: true } }
    }
  });
  const woStatsByStatus = await prisma.workOrder.groupBy({
    by: ["status"],
    where: { assetId: id },
    _count: { status: true }
  });
  const statsMap = Object.fromEntries(
    woStatsByStatus.map((s) => [s.status, s._count.status])
  );
  const woStats = {
    total: asset._count.WorkOrder,
    pending: statsMap["PENDING"] || 0,
    inProgress: statsMap["IN_PROGRESS"] || 0,
    completed: statsMap["COMPLETED"] || 0
  };
  return {
    asset,
    units,
    woStats
  };
};
const actions = {
  update: async (event) => {
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const { id } = event.params;
    const organizationId = event.locals.user.organizationId;
    const rawData = {
      name: formData.get("name"),
      unitId: formData.get("unitId"),
      type: formData.get("type"),
      status: formData.get("status"),
      description: formData.get("description"),
      purchaseDate: formData.get("purchaseDate"),
      warrantyExpiry: formData.get("warrantyExpiry")
    };
    const validationResult = assetSchema.safeParse(rawData);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return fail(400, { error: firstError.message });
    }
    const data = validationResult.data;
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
        id: data.unitId,
        Site: {
          organizationId: organizationId ?? void 0
        }
      }
    });
    if (!unit) {
      return fail(404, { error: "Unit not found" });
    }
    const asset = await prisma.asset.update({
      where: { id },
      data: {
        name: data.name.trim(),
        type: data.type ? data.type : void 0,
        status: data.status ? data.status : void 0,
        description: data.description ? data.description.trim() : void 0,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
        unitId: data.unitId,
        siteId: unit.siteId
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
