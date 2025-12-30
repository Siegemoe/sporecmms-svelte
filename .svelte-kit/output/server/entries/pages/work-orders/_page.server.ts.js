import { c as createRequestPrisma } from "../../../chunks/prisma.js";
import { b as broadcastToOrg } from "../../../chunks/websocket-handler.js";
import { r as requireAuth } from "../../../chunks/guards.js";
import { f as fail } from "../../../chunks/index.js";
import { l as logAudit } from "../../../chunks/audit.js";
import { e as PRIORITY_ORDER, g as DEFAULT_PRIORITY, P as PRIORITIES } from "../../../chunks/constants.js";
const load = async (event) => {
  requireAuth(event);
  const prisma = await createRequestPrisma(event);
  const userId = event.locals.user.id;
  const organizationId = event.locals.user.organizationId;
  const myOnly = event.url.searchParams.get("my") === "true";
  const status = event.url.searchParams.get("status");
  const priority = event.url.searchParams.get("priority");
  const siteId = event.url.searchParams.get("siteId");
  const sort = event.url.searchParams.get("sort") || "dueDate";
  const search = event.url.searchParams.get("search");
  const where = {
    organizationId
    // Implicitly enforced by extension, but explicit is cleaner
  };
  if (myOnly)
    where.assignedToId = userId;
  if (status)
    where.status = status;
  if (priority)
    where.priority = priority;
  if (siteId)
    where.siteId = siteId;
  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search.trim(), mode: "insensitive" } },
      { description: { contains: search.trim(), mode: "insensitive" } }
    ];
  }
  let orderBy = [];
  if (sort === "priority") {
    orderBy = { createdAt: "desc" };
  } else if (sort === "created") {
    orderBy = { createdAt: "desc" };
  } else if (sort === "updated") {
    orderBy = { updatedAt: "desc" };
  } else {
    orderBy = [
      { dueDate: "asc" },
      { createdAt: "desc" }
    ];
  }
  const workOrders = await prisma.workOrder.findMany({
    where,
    include: {
      Asset: {
        select: {
          id: true,
          name: true
        }
      },
      Building: {
        select: {
          id: true,
          name: true,
          Site: {
            select: {
              name: true
            }
          }
        }
      },
      Unit: {
        select: {
          id: true,
          roomNumber: true,
          name: true,
          Building: {
            select: {
              name: true
            }
          },
          Site: {
            select: {
              name: true
            }
          }
        }
      },
      Site: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy
  });
  const assets = await prisma.asset.findMany({
    where: {
      Unit: {
        Site: {
          organizationId: organizationId ?? void 0
        }
      }
    },
    include: {
      Unit: {
        include: {
          Site: { select: { name: true } },
          Building: { select: { name: true } }
        }
      }
    },
    orderBy: { name: "asc" }
  });
  const units = await prisma.unit.findMany({
    where: {
      Site: {
        organizationId: organizationId ?? void 0
      }
    },
    include: {
      Site: { select: { name: true } },
      Building: { select: { name: true } }
    },
    orderBy: [
      { Site: { name: "asc" } },
      { Building: { name: "asc" } },
      { roomNumber: "asc" }
    ]
  });
  const buildings = await prisma.building.findMany({
    where: {
      Site: {
        organizationId: organizationId ?? void 0
      }
    },
    include: {
      Site: { select: { name: true } }
    },
    orderBy: [
      { Site: { name: "asc" } },
      { name: "asc" }
    ]
  });
  const sites = await prisma.site.findMany({
    where: {
      organizationId: organizationId ?? void 0
    },
    orderBy: { name: "asc" }
  });
  const users = await prisma.user.findMany({
    where: { organizationId: organizationId ?? void 0 },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true
    },
    orderBy: { firstName: "asc" }
  });
  const transformedWorkOrders = workOrders.map((wo) => ({
    ...wo,
    asset: wo.Asset,
    building: wo.Building,
    unit: wo.Unit,
    site: wo.Site,
    // Remove PascalCase versions
    Asset: void 0,
    Building: void 0,
    Unit: void 0,
    Site: void 0
  }));
  if (sort === "priority") {
    transformedWorkOrders.sort((a, b) => {
      const aOrder = PRIORITY_ORDER[a.priority] ?? 999;
      const bOrder = PRIORITY_ORDER[b.priority] ?? 999;
      if (aOrder !== bOrder)
        return aOrder - bOrder;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  const transformedAssets = assets.map((asset) => ({
    ...asset,
    room: asset.Unit ? {
      ...asset.Unit,
      name: asset.Unit.name || asset.Unit.roomNumber,
      site: asset.Unit.Site,
      building: asset.Unit.Building
    } : null,
    Unit: void 0
  }));
  const transformedUnits = units.map((unit) => ({
    ...unit,
    Site: void 0,
    Building: void 0
  }));
  const transformedBuildings = buildings.map((building) => ({
    ...building,
    Site: void 0
  }));
  return {
    workOrders: transformedWorkOrders,
    assets: transformedAssets,
    units: transformedUnits,
    buildings: transformedBuildings,
    sites,
    users,
    myOnly,
    status,
    priority,
    siteId,
    sort,
    search
  };
};
const actions = {
  /**
   * Create a new Work Order
   */
  create: async (event) => {
    const prisma = await createRequestPrisma(event);
    const data = await event.request.formData();
    const title = data.get("title");
    const description = data.get("description");
    const priority = data.get("priority") || DEFAULT_PRIORITY;
    const dueDate = data.get("dueDate");
    const assignedToId = data.get("assignedToId");
    const selectionMode = data.get("selectionMode") || "asset";
    const assetId = data.get("assetId");
    const unitId = data.get("unitId") || data.get("roomId");
    const buildingId = data.get("buildingId");
    const siteId = data.get("siteId");
    if (!title?.trim()) {
      return fail(400, { error: "Title is required." });
    }
    if (!PRIORITIES.includes(priority)) {
      return fail(400, { error: "Invalid priority value." });
    }
    const trimmedDescription = description?.trim() || "";
    if (trimmedDescription.length > 5e3) {
      return fail(400, { error: "Description is too long (max 5000 characters)." });
    }
    if (dueDate) {
      const parsedDate = new Date(dueDate);
      if (isNaN(parsedDate.getTime())) {
        return fail(400, { error: "Invalid due date format." });
      }
    }
    if (!assetId && !unitId && !buildingId && !siteId) {
      return fail(400, { error: "Please select an asset, unit, building, or site." });
    }
    if (assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: assignedToId },
        select: { organizationId: true }
      });
      if (!assignedUser || assignedUser.organizationId !== event.locals.user.organizationId) {
        return fail(400, { error: "Invalid user assignment." });
      }
    }
    try {
      const organizationId = event.locals.user.organizationId;
      const createdById = event.locals.user.id;
      const newWo = await prisma.workOrder.create({
        data: {
          title: title.trim(),
          description: trimmedDescription,
          priority,
          dueDate: dueDate ? new Date(dueDate) : null,
          organizationId,
          // Ensure non-null
          createdById,
          assignedToId: assignedToId || null,
          status: "PENDING",
          updatedAt: /* @__PURE__ */ new Date(),
          // Only set the relevant ID based on selection mode
          ...selectionMode === "asset" && { assetId },
          ...(selectionMode === "unit" || selectionMode === "room") && { unitId },
          ...selectionMode === "building" && { buildingId },
          ...selectionMode === "site" && { siteId }
        },
        select: {
          id: true,
          title: true,
          status: true,
          assetId: true,
          buildingId: true,
          unitId: true,
          siteId: true,
          organizationId: true,
          createdAt: true,
          priority: true,
          dueDate: true
        }
      });
      broadcastToOrg(organizationId, {
        type: "WO_NEW",
        payload: newWo
      });
      await logAudit(event.locals.user.id, "WORK_ORDER_CREATED", {
        workOrderId: newWo.id,
        title: newWo.title,
        priority: newWo.priority,
        dueDate: newWo.dueDate,
        selectionMode,
        selectionDetails: selectionMode === "asset" ? { assetId } : selectionMode === "unit" || selectionMode === "room" ? { unitId } : selectionMode === "building" ? { buildingId } : selectionMode === "site" ? { siteId } : {}
      });
      return { success: true, workOrder: newWo };
    } catch (e) {
      console.error("Error creating work order:", e);
      return { success: false, error: "Failed to create work order." };
    }
  },
  /** * Handles updating the status of a Work Order.
   * This is the core workflow trigger for the real-time system.
   */
  updateStatus: async (event) => {
    const { request } = event;
    const prisma = await createRequestPrisma(event);
    const data = await request.formData();
    const woId = data.get("workOrderId");
    const newStatus = data.get("status");
    if (!woId || !newStatus) {
      return { success: false, error: "Missing ID or status." };
    }
    try {
      const updatedWo = await prisma.workOrder.update({
        where: { id: woId },
        data: { status: newStatus },
        // Select specific fields for the broadcast payload
        select: {
          id: true,
          title: true,
          status: true,
          assetId: true,
          organizationId: true
        }
      });
      if (!updatedWo) {
        return { success: false, error: "Work order not found." };
      }
      broadcastToOrg(updatedWo.organizationId, {
        type: "WO_UPDATE",
        payload: updatedWo
      });
      await logAudit(event.locals.user.id, "WORK_ORDER_STATUS_CHANGED", {
        workOrderId: updatedWo.id,
        title: updatedWo.title,
        newStatus
      });
      return { success: true, updatedWo };
    } catch (e) {
      console.error("Error updating WO status:", e);
      return { success: false, error: "Database transaction failed." };
    }
  },
  assign: async (event) => {
    const prisma = await createRequestPrisma(event);
    const data = await event.request.formData();
    const woId = data.get("workOrderId");
    const assignedToId = data.get("assignedToId");
    if (!woId) {
      return fail(400, { error: "Work order ID required" });
    }
    try {
      const updatedWo = await prisma.workOrder.update({
        where: { id: woId },
        data: { assignedToId: assignedToId || null },
        select: {
          id: true,
          title: true,
          status: true,
          assignedToId: true,
          organizationId: true
        }
      });
      broadcastToOrg(updatedWo.organizationId, {
        type: "WO_UPDATE",
        payload: updatedWo
      });
      await logAudit(event.locals.user.id, "WORK_ORDER_ASSIGNED", {
        workOrderId: updatedWo.id,
        title: updatedWo.title,
        assignedToId: assignedToId || null
      });
      return { success: true };
    } catch (e) {
      console.error("Error assigning WO:", e);
      return fail(500, { error: "Failed to assign work order" });
    }
  }
};
export {
  actions,
  load
};
