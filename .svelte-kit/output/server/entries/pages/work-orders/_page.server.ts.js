import { c as createRequestPrisma } from "../../../chunks/prisma.js";
import { r as requireAuth } from "../../../chunks/guards.js";
import { e as error, f as fail } from "../../../chunks/index.js";
import { D as DEFAULT_PRIORITY, h as DEFAULT_SELECTION_MODE, P as PRIORITIES } from "../../../chunks/constants.js";
import { q as queryWorkOrders, a as queryLocationOptions, M as MAX_DESCRIPTION_LENGTH, c as createWorkOrder, u as updateWorkOrderStatus, b as assignWorkOrder } from "../../../chunks/service.js";
import { S as SecurityManager, a as SECURITY_RATE_LIMITS } from "../../../chunks/security.js";
import { q as queryTemplates, a as applyTemplate } from "../../../chunks/templates.js";
import { l as logError, a as logWarn } from "../../../chunks/logger.js";
const load = async (event) => {
  try {
    requireAuth(event);
    const prisma = await createRequestPrisma(event);
    const userId = event.locals.user.id;
    const organizationId = event.locals.user.organizationId;
    if (!organizationId) {
      throw error(400, "Organization required");
    }
    const myOnly = event.url.searchParams.get("my") === "true";
    const unassigned = event.url.searchParams.get("unassigned") === "true";
    const status = event.url.searchParams.get("status");
    const priority = event.url.searchParams.get("priority");
    const siteId = event.url.searchParams.get("siteId");
    const sort = event.url.searchParams.get("sort") || "dueDate";
    const search = event.url.searchParams.get("search");
    let assignedToId;
    if (myOnly)
      assignedToId = userId;
    else if (unassigned)
      assignedToId = "unassigned";
    const workOrders = await queryWorkOrders(prisma, {
      organizationId,
      assignedToId,
      status: status || void 0,
      priority: priority || void 0,
      siteId: siteId || void 0,
      sort,
      search: search || void 0
    });
    const locationOptions = await queryLocationOptions(prisma, organizationId);
    const templates = await queryTemplates(prisma, {
      organizationId,
      isActive: true
    });
    return {
      workOrders,
      ...locationOptions,
      templates,
      myOnly,
      unassigned,
      status,
      priority,
      siteId,
      sort,
      search
    };
  } catch (e) {
    logError("Failed to load work orders page", e, {
      userId: event.locals.user?.id,
      organizationId: event.locals.user?.organizationId
    });
    throw error(500, "Failed to load work orders. Please try again later.");
  }
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
    const userId = event.locals.user?.id;
    const organizationId = event.locals.user?.organizationId;
    const data = await event.request.formData();
    let title = data.get("title");
    let description = data.get("description");
    const failureMode = data.get("failureMode");
    let priority = data.get("priority") || DEFAULT_PRIORITY;
    if (failureMode && failureMode !== "General") {
      description = description ? `${description}

Failure Mode: ${failureMode}` : `Failure Mode: ${failureMode}`;
    }
    const dueDate = data.get("dueDate");
    const assignedToId = data.get("assignedToId");
    const selectionMode = data.get("selectionMode") || DEFAULT_SELECTION_MODE;
    const assetId = data.get("assetId");
    const unitId = data.get("unitId") || data.get("roomId");
    const buildingId = data.get("buildingId");
    const siteId = data.get("siteId");
    const templateId = data.get("templateId");
    let checklistItems = [];
    if (templateId && organizationId) {
      const templateResult = await applyTemplate(prisma, templateId, organizationId);
      if ("status" in templateResult) {
        return templateResult;
      }
      if (!title?.trim() && templateResult.title) {
        title = templateResult.title;
      }
      if (!description?.trim() && templateResult.description) {
        description = templateResult.description;
      }
      if (priority === DEFAULT_PRIORITY && templateResult.priority) {
        priority = templateResult.priority;
      }
      checklistItems = templateResult.items || [];
    }
    if (!title?.trim()) {
      logWarn("Work order creation failed: Title missing", { userId, organizationId });
      return fail(400, { error: "Title is required." });
    }
    if (!PRIORITIES.includes(priority)) {
      logWarn("Work order creation failed: Invalid priority", { userId, organizationId, priority });
      return fail(400, { error: "Invalid priority value." });
    }
    const trimmedDescription = description?.trim() || "";
    if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
      logWarn("Work order creation failed: Description too long", { userId, organizationId });
      return fail(400, { error: `Description is too long (max ${MAX_DESCRIPTION_LENGTH} characters).` });
    }
    let parsedDueDate = null;
    if (dueDate) {
      parsedDueDate = new Date(dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        logWarn("Work order creation failed: Invalid due date", { userId, organizationId, dueDate });
        return fail(400, { error: "Invalid due date format." });
      }
    }
    if (!assetId && !unitId && !buildingId && !siteId) {
      logWarn("Work order creation failed: No location selected", { userId, organizationId });
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
      siteId,
      checklistItems
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
