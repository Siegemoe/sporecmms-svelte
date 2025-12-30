import { c as createRequestPrisma } from "../../../chunks/prisma.js";
import { f as fail } from "../../../chunks/index.js";
import { r as requireAuth, i as isManagerOrAbove } from "../../../chunks/guards.js";
import { l as logAudit } from "../../../chunks/audit.js";
import { a as assetSchema } from "../../../chunks/validation.js";
const load = async (event) => {
  requireAuth(event);
  const prisma = await createRequestPrisma(event);
  const organizationId = event.locals.user.organizationId;
  const typeFilter = event.url.searchParams.get("type");
  const statusFilter = event.url.searchParams.get("status");
  const siteFilter = event.url.searchParams.get("siteId");
  const sortFilter = event.url.searchParams.get("sort") || "created";
  const where = {
    Unit: {
      Site: {
        organizationId: organizationId ?? void 0
      }
    }
  };
  if (typeFilter)
    where.type = typeFilter;
  if (statusFilter)
    where.status = statusFilter;
  if (siteFilter)
    where.siteId = siteFilter;
  let orderBy = { createdAt: "desc" };
  switch (sortFilter) {
    case "name":
      orderBy = { name: "asc" };
      break;
    case "type":
      orderBy = [{ type: "asc" }, { createdAt: "desc" }];
      break;
    case "status":
      orderBy = [{ status: "asc" }, { createdAt: "desc" }];
      break;
    case "created":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }
  const assets = await prisma.asset.findMany({
    where,
    orderBy,
    include: {
      Unit: {
        include: {
          Site: {
            select: { name: true }
          },
          Building: {
            select: { name: true }
          }
        }
      },
      _count: {
        select: { WorkOrder: true }
      }
    }
  });
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
      Site: {
        select: { name: true }
      },
      Building: {
        select: { name: true }
      }
    }
  });
  const sites = await prisma.site.findMany({
    where: {
      organizationId: organizationId ?? void 0
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true
    }
  });
  return {
    assets,
    units,
    sites,
    type: typeFilter,
    status: statusFilter,
    siteId: siteFilter,
    sort: sortFilter
  };
};
const actions = {
  create: async (event) => {
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const organizationId = event.locals.user.organizationId;
    const rawData = {
      name: formData.get("name"),
      unitId: formData.get("unitId"),
      type: formData.get("type"),
      status: formData.get("status") || "OPERATIONAL",
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
    const asset = await prisma.asset.create({
      data: {
        name: data.name.trim(),
        type: data.type || "OTHER",
        status: data.status || "OPERATIONAL",
        description: data.description?.trim() || null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
        unitId: data.unitId,
        siteId: unit.siteId,
        updatedAt: /* @__PURE__ */ new Date()
      }
    });
    await logAudit(event.locals.user.id, "ASSET_CREATED", {
      assetId: asset.id,
      name: asset.name,
      unitId: data.unitId
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
        Unit: {
          Site: {
            organizationId: organizationId ?? void 0
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
    if (!assetId) {
      return fail(400, { error: "Asset ID is required" });
    }
    const existingAsset = await prisma.asset.findFirst({
      where: {
        id: assetId,
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
      where: { id: assetId },
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
  }
};
export {
  actions,
  load
};
