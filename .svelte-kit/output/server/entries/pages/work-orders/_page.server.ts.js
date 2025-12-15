import { c as createRequestPrisma } from "../../../chunks/prisma.js";
import { b as broadcastToOrg } from "../../../chunks/websocket-handler.js";
import { r as requireAuth } from "../../../chunks/guards.js";
import { f as fail } from "../../../chunks/index.js";
import { l as logAudit } from "../../../chunks/audit.js";
const load = async (event) => {
  requireAuth(event);
  const prisma = await createRequestPrisma(event);
  const myOnly = event.url.searchParams.get("my") === "true";
  const userId = event.locals.user.id;
  const workOrders = await prisma.workOrder.findMany({
    where: myOnly ? { assignedToId: userId } : void 0,
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
      room: {
        select: {
          id: true,
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
      assignedTo: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  const assets = await prisma.asset.findMany({
    include: {
      room: {
        include: {
          site: { select: { name: true } }
        }
      }
    },
    orderBy: { name: "asc" }
  });
  const users = await prisma.user.findMany({
    where: { orgId: event.locals.user.orgId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true
    },
    orderBy: { firstName: "asc" }
  });
  return { workOrders, assets, users, myOnly };
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
    const failureMode = data.get("failureMode") || "General";
    const selectionMode = data.get("selectionMode") || "asset";
    const assetId = data.get("assetId");
    const roomId = data.get("roomId");
    const buildingId = data.get("buildingId");
    if (!title) {
      return { success: false, error: "Title is required." };
    }
    if (!assetId && !roomId && !buildingId) {
      return { success: false, error: "Please select an asset, room, or building." };
    }
    try {
      const orgId = event.locals.user.orgId;
      const newWo = await prisma.workOrder.create({
        data: {
          title: title.trim(),
          description: description?.trim() || "",
          failureMode,
          orgId,
          status: "PENDING",
          // Only set the relevant ID based on selection mode
          ...selectionMode === "asset" && { assetId },
          ...selectionMode === "room" && { roomId },
          ...selectionMode === "building" && { buildingId }
        },
        select: {
          id: true,
          title: true,
          status: true,
          assetId: true,
          buildingId: true,
          roomId: true,
          orgId: true,
          createdAt: true
        }
      });
      broadcastToOrg(orgId, {
        type: "WO_NEW",
        payload: newWo
      });
      await logAudit(event.locals.user.id, "WORK_ORDER_CREATED", {
        workOrderId: newWo.id,
        title: newWo.title,
        selectionMode,
        selectionDetails: selectionMode === "asset" ? { assetId } : selectionMode === "room" ? { roomId } : selectionMode === "building" ? { buildingId } : {}
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
          orgId: true
        }
      });
      if (!updatedWo) {
        return { success: false, error: "Work order not found." };
      }
      broadcastToOrg(updatedWo.orgId, {
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
          orgId: true,
          assignedTo: {
            select: { firstName: true, lastName: true }
          }
        }
      });
      broadcastToOrg(updatedWo.orgId, {
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
