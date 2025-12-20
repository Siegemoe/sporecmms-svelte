import { c as createRequestPrisma } from "../../../chunks/prisma.js";
import { b as broadcastToOrg } from "../../../chunks/websocket-handler.js";
import { r as requireAuth } from "../../../chunks/guards.js";
import { f as fail } from "../../../chunks/index.js";
import { l as logAudit } from "../../../chunks/audit.js";
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
  let orderBy = [];
  if (sort === "priority") {
    orderBy = { priority: "desc" };
  } else if (sort === "created") {
    orderBy = { createdAt: "desc" };
  } else if (sort === "updated") {
    orderBy = { updatedAt: "desc" };
  } else {
    orderBy = [
      { dueDate: "asc" },
      { priority: "desc" }
    ];
  }
  const workOrders = await prisma.workOrder.findMany({
    where,
    include: {
      asset: {
        select: {
          id: true,
          name: true
        }
      },
      building: {
        select: {
          id: true,
          name: true,
          site: {
            select: {
              name: true
            }
          }
        }
      },
      unit: {
        select: {
          id: true,
          roomNumber: true,
          name: true,
          building: {
            select: {
              name: true
            }
          },
          site: {
            select: {
              name: true
            }
          }
        }
      },
      site: {
        select: {
          id: true,
          name: true
        }
      },
      assignedTo: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy
  });
  const assets = await prisma.asset.findMany({
    where: {
      Unit: {
        Site: {
          organizationId
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
        organizationId
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
        organizationId
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
      organizationId
    },
    orderBy: { name: "asc" }
  });
  const users = await prisma.user.findMany({
    where: { organizationId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true
    },
    orderBy: { firstName: "asc" }
  });
  return { workOrders, assets, units, buildings, sites, users, myOnly, status, priority, siteId, sort };
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
    const priority = data.get("priority") || "MEDIUM";
    const dueDate = data.get("dueDate");
    const assignedToId = data.get("assignedToId");
    const selectionMode = data.get("selectionMode") || "asset";
    const assetId = data.get("assetId");
    const unitId = data.get("unitId") || data.get("roomId");
    const buildingId = data.get("buildingId");
    const siteId = data.get("siteId");
    if (!title) {
      return { success: false, error: "Title is required." };
    }
    if (!assetId && !unitId && !buildingId && !siteId) {
      return { success: false, error: "Please select an asset, unit, building, or site." };
    }
    try {
      const organizationId = event.locals.user.organizationId;
      const createdById = event.locals.user.id;
      const newWo = await prisma.workOrder.create({
        data: {
          title: title.trim(),
          description: description?.trim() || "",
          priority,
          dueDate: dueDate ? new Date(dueDate) : null,
          organizationId,
          // Ensure non-null
          createdById,
          assignedToId: assignedToId || null,
          status: "PENDING",
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
          organizationId: true,
          assignedTo: {
            select: { firstName: true, lastName: true }
          }
        }
      });
      broadcastToOrg(updatedWo.organizationId, {
        type: "WO_UPDATE",
        payload: updatedWo
      });
      await logAudit(event.locals.user.id, "WORK_ORDER_ASSIGNED", {
        workOrderId: updatedWo.id,
        title: updatedWo.title,
        assignedToId: assignedToId || null,
        assignedToName: updatedWo.assignedTo ? `${updatedWo.assignedTo.firstName || ""} ${updatedWo.assignedTo.lastName || ""}`.trim() : null
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
