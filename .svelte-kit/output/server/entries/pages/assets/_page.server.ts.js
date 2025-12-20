import { c as createRequestPrisma } from "../../../chunks/prisma.js";
import { f as fail } from "../../../chunks/index.js";
import { r as requireAuth, i as isManagerOrAbove } from "../../../chunks/guards.js";
import { l as logAudit } from "../../../chunks/audit.js";
const load = async (event) => {
  requireAuth(event);
  const prisma = await createRequestPrisma(event);
  const unitFilter = event.url.searchParams.get("unit");
  const organizationId = event.locals.user.organizationId;
  const assets = await prisma.asset.findMany({
    where: {
      unit: {
        site: {
          organizationId
        }
      },
      ...unitFilter && { unitId: unitFilter }
    },
    orderBy: { createdAt: "desc" },
    include: {
      unit: {
        include: {
          site: {
            select: { name: true }
          },
          building: {
            select: { name: true }
          }
        }
      },
      _count: {
        select: { workOrders: true }
      }
    }
  });
  const units = await prisma.unit.findMany({
    where: {
      site: {
        organizationId
      }
    },
    orderBy: [
      { site: { name: "asc" } },
      { building: { name: "asc" } },
      { roomNumber: "asc" }
    ],
    include: {
      site: {
        select: { name: true }
      },
      building: {
        select: { name: true }
      }
    }
  });
  return { assets, units, unitFilter };
};
const actions = {
  create: async (event) => {
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const name = formData.get("name");
    const unitId = formData.get("unitId");
    const type = formData.get("type");
    const status = formData.get("status") || "OPERATIONAL";
    const description = formData.get("description");
    const purchaseDate = formData.get("purchaseDate");
    const warrantyExpiry = formData.get("warrantyExpiry");
    const organizationId = event.locals.user.organizationId;
    if (!name || name.trim() === "") {
      return fail(400, { error: "Asset name is required" });
    }
    if (!unitId) {
      return fail(400, { error: "Unit is required" });
    }
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        site: {
          organizationId
        }
      }
    });
    if (!unit) {
      return fail(404, { error: "Unit not found" });
    }
    const siteId = unit.siteId;
    const asset = await prisma.asset.create({
      data: {
        name: name.trim(),
        type,
        status,
        description: description?.trim() || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
        unitId,
        siteId
      }
    });
    await logAudit(event.locals.user.id, "ASSET_CREATED", {
      assetId: asset.id,
      name: asset.name,
      unitId
    });
    return { success: true, asset };
  },
  delete: async (event) => {
    if (!isManagerOrAbove(event)) {
      return fail(403, { error: "Permission denied. Only managers can delete assets." });
    }
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const organizationId = event.locals.user.organizationId;
    const assetId = formData.get("assetId");
    if (!assetId) {
      return fail(400, { error: "Asset ID is required" });
    }
    const asset = await prisma.asset.findFirst({
      where: {
        id: assetId,
        unit: {
          site: {
            organizationId
          }
        }
      },
      select: { name: true }
    });
    if (!asset) {
      return fail(404, { error: "Asset not found" });
    }
    await prisma.asset.delete({
      where: { id: assetId }
    });
    await logAudit(event.locals.user.id, "ASSET_DELETED", {
      assetId,
      name: asset?.name
    });
    return { success: true };
  },
  update: async (event) => {
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const organizationId = event.locals.user.organizationId;
    const assetId = formData.get("assetId");
    const name = formData.get("name");
    const unitId = formData.get("unitId");
    const type = formData.get("type");
    const status = formData.get("status");
    const description = formData.get("description");
    const purchaseDate = formData.get("purchaseDate");
    const warrantyExpiry = formData.get("warrantyExpiry");
    if (!assetId) {
      return fail(400, { error: "Asset ID is required" });
    }
    if (!name || name.trim() === "") {
      return fail(400, { error: "Asset name is required" });
    }
    if (!unitId) {
      return fail(400, { error: "Unit is required" });
    }
    const existingAsset = await prisma.asset.findFirst({
      where: {
        id: assetId,
        unit: {
          site: {
            organizationId
          }
        }
      }
    });
    if (!existingAsset) {
      return fail(404, { error: "Asset not found" });
    }
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        site: {
          organizationId
        }
      }
    });
    if (!unit) {
      return fail(404, { error: "Unit not found" });
    }
    const siteId = unit.siteId;
    const asset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        name: name.trim(),
        type: type ? type : void 0,
        status: status ? status : void 0,
        description: description ? description.trim() : void 0,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
        unitId,
        siteId
      }
    });
    return { success: true, asset };
  }
};
export {
  actions,
  load
};
