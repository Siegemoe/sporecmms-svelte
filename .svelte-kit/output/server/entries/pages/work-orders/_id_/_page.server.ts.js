import { c as createRequestPrisma } from "../../../../chunks/prisma.js";
import { b as broadcastToOrg } from "../../../../chunks/websocket-handler.js";
import { e as error, f as fail, r as redirect } from "../../../../chunks/index.js";
import { r as requireAuth, i as isManagerOrAbove } from "../../../../chunks/guards.js";
import { l as logAudit } from "../../../../chunks/audit.js";
const load = async (event) => {
  requireAuth(event);
  const prisma = await createRequestPrisma(event);
  const { id } = event.params;
  const workOrder = await prisma.workOrder.findUnique({
    where: { id },
    include: {
      asset: {
        include: {
          unit: {
            include: {
              site: { select: { id: true, name: true } }
            }
          }
        }
      }
    }
  });
  if (!workOrder) {
    throw error(404, "Work order not found");
  }
  const assets = await prisma.asset.findMany({
    where: {
      unit: {
        site: {
          organizationId: event.locals.user.organizationId
        }
      }
    },
    include: {
      unit: {
        include: {
          site: { select: { name: true } }
        }
      }
    },
    orderBy: { name: "asc" }
  });
  const workOrderWithRoom = workOrder ? {
    ...workOrder,
    asset: workOrder.asset ? {
      ...workOrder.asset,
      room: workOrder.asset.unit ? {
        ...workOrder.asset.unit,
        name: workOrder.asset.unit.name || workOrder.asset.unit.roomNumber
      } : null
    } : null
  } : null;
  const assetsWithRoom = assets.map((asset) => ({
    ...asset,
    room: asset.unit ? {
      ...asset.unit,
      name: asset.unit.name || asset.unit.roomNumber
    } : null
  }));
  return { workOrder: workOrderWithRoom, assets: assetsWithRoom };
};
const actions = {
  updateStatus: async (event) => {
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const { id } = event.params;
    const newStatus = formData.get("status");
    if (!newStatus) {
      return fail(400, { error: "Status is required" });
    }
    const updatedWo = await prisma.workOrder.update({
      where: { id },
      data: { status: newStatus },
      select: {
        id: true,
        title: true,
        status: true,
        assetId: true,
        organizationId: true
      }
    });
    broadcastToOrg(updatedWo.organizationId, {
      type: "WO_UPDATE",
      payload: updatedWo
    });
    return { success: true, workOrder: updatedWo };
  },
  update: async (event) => {
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const { id } = event.params;
    const title = formData.get("title");
    const description = formData.get("description");
    const assetId = formData.get("assetId");
    formData.get("failureMode");
    if (!title || title.trim() === "") {
      return fail(400, { error: "Title is required" });
    }
    if (!assetId) {
      return fail(400, { error: "Asset is required" });
    }
    const workOrder = await prisma.workOrder.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description?.trim() || "",
        assetId
        // failureMode: failureMode || 'General' // Removed: Field does not exist in WorkOrder schema
      }
    });
    return { success: true, workOrder };
  },
  delete: async (event) => {
    if (!isManagerOrAbove(event)) {
      return fail(403, { error: "Permission denied. Only managers can delete work orders." });
    }
    const prisma = await createRequestPrisma(event);
    const { id } = event.params;
    const wo = await prisma.workOrder.findUnique({
      where: { id },
      select: { title: true }
    });
    await prisma.workOrder.delete({
      where: { id }
    });
    await logAudit(event.locals.user.id, "WORK_ORDER_DELETED", {
      workOrderId: id,
      title: wo?.title
    });
    throw redirect(303, "/work-orders");
  }
};
export {
  actions,
  load
};
