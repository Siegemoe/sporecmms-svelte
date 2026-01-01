import { c as createRequestPrisma } from "../../../chunks/prisma.js";
import { r as requireAuth } from "../../../chunks/guards.js";
import { e as error, f as fail } from "../../../chunks/index.js";
import { e as DEFAULT_PRIORITY, g as DEFAULT_SELECTION_MODE, P as PRIORITIES } from "../../../chunks/constants.js";
import { q as queryWorkOrders, a as queryLocationOptions, M as MAX_DESCRIPTION_LENGTH, c as createWorkOrder, u as updateWorkOrderStatus, b as assignWorkOrder } from "../../../chunks/service.js";
import { a as SECURITY_RATE_LIMITS, S as SecurityManager } from "../../../chunks/security.js";
const load = async (event) => {
  requireAuth(event);
  const prisma = await createRequestPrisma(event);
  const userId = event.locals.user.id;
  const organizationId = event.locals.user.organizationId;
  if (!organizationId) {
    throw error(400, "Organization required");
  }
  const myOnly = event.url.searchParams.get("my") === "true";
  const status = event.url.searchParams.get("status");
  const priority = event.url.searchParams.get("priority");
  const siteId = event.url.searchParams.get("siteId");
  const sort = event.url.searchParams.get("sort") || "dueDate";
  const search = event.url.searchParams.get("search");
  const workOrders = await queryWorkOrders(prisma, {
    organizationId,
    assignedToId: myOnly ? userId : void 0,
    status: status || void 0,
    priority: priority || void 0,
    siteId: siteId || void 0,
    sort,
    search: search || void 0
  });
  const locationOptions = await queryLocationOptions(prisma, organizationId);
  return {
    workOrders,
    ...locationOptions,
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
    const security = SecurityManager.getInstance();
    const rateLimitResult = await security.checkRateLimit(
      { event, action: "work_order_create", userId: event.locals.user?.id },
      SECURITY_RATE_LIMITS.FORM
    );
    if (!rateLimitResult.success) {
      if (rateLimitResult.blocked) {
        return fail(429, { error: "Too many requests. Your IP has been temporarily blocked." });
      }
      return fail(429, { error: "Too many requests. Please try again later." });
    }
    const prisma = await createRequestPrisma(event);
    const data = await event.request.formData();
    const title = data.get("title");
    const description = data.get("description");
    const priority = data.get("priority") || DEFAULT_PRIORITY;
    const dueDate = data.get("dueDate");
    const assignedToId = data.get("assignedToId");
    const selectionMode = data.get("selectionMode") || DEFAULT_SELECTION_MODE;
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
    if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
      return fail(400, { error: `Description is too long (max ${MAX_DESCRIPTION_LENGTH} characters).` });
    }
    let parsedDueDate = null;
    if (dueDate) {
      parsedDueDate = new Date(dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        return fail(400, { error: "Invalid due date format." });
      }
    }
    if (!assetId && !unitId && !buildingId && !siteId) {
      return fail(400, { error: "Please select an asset, unit, building, or site." });
    }
    return createWorkOrder(event, prisma, {
      title,
      description: trimmedDescription,
      priority,
      dueDate: parsedDueDate,
      assignedToId: assignedToId || void 0,
      selectionMode: selectionMode || "asset",
      assetId,
      unitId,
      buildingId,
      siteId
    });
  },
  /**
   * Handles updating the status of a Work Order.
   * This is the core workflow trigger for the real-time system.
   */
  updateStatus: async (event) => {
    const security = SecurityManager.getInstance();
    const rateLimitResult = await security.checkRateLimit(
      { event, action: "work_order_status_update", userId: event.locals.user?.id },
      SECURITY_RATE_LIMITS.FORM
    );
    if (!rateLimitResult.success) {
      if (rateLimitResult.blocked) {
        return fail(429, { error: "Too many requests. Your IP has been temporarily blocked." });
      }
      return fail(429, { error: "Too many requests. Please try again later." });
    }
    const prisma = await createRequestPrisma(event);
    const data = await event.request.formData();
    const woId = data.get("workOrderId");
    const newStatus = data.get("status");
    if (!woId || !newStatus) {
      return { success: false, error: "Missing ID or status." };
    }
    return updateWorkOrderStatus(event, prisma, woId, newStatus);
  },
  assign: async (event) => {
    const security = SecurityManager.getInstance();
    const rateLimitResult = await security.checkRateLimit(
      { event, action: "work_order_assign", userId: event.locals.user?.id },
      SECURITY_RATE_LIMITS.FORM
    );
    if (!rateLimitResult.success) {
      if (rateLimitResult.blocked) {
        return fail(429, { error: "Too many requests. Your IP has been temporarily blocked." });
      }
      return fail(429, { error: "Too many requests. Please try again later." });
    }
    const prisma = await createRequestPrisma(event);
    const data = await event.request.formData();
    const woId = data.get("workOrderId");
    const assignedToId = data.get("assignedToId");
    if (!woId) {
      return fail(400, { error: "Work order ID required" });
    }
    return assignWorkOrder(event, prisma, woId, assignedToId || null);
  }
};
export {
  actions,
  load
};
