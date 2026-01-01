import { c as createRequestPrisma } from "../../../../chunks/prisma.js";
import { f as fail, e as error, r as redirect } from "../../../../chunks/index.js";
import { r as requireAuth } from "../../../../chunks/guards.js";
import { f as formatUserName, q as queryStatusHistory, a as formatStatusHistory } from "../../../../chunks/status-history.js";
import { S as SecurityManager, a as SECURITY_RATE_LIMITS } from "../../../../chunks/security.js";
import { v as validateInput, w as workOrderCommentSchema, b as workOrderChecklistSchema } from "../../../../chunks/validation.js";
import { d as MAX_COMMENT_LENGTH, e as MAX_COMMENT_DEPTH, f as broadcastToOrg, l as logError, g as queryWorkOrderById, h as queryAssetsForDropdown, u as updateWorkOrderStatus, i as updateWorkOrderDetails, j as deleteWorkOrder } from "../../../../chunks/service.js";
import { l as logAudit } from "../../../../chunks/audit.js";
import { p as parseMentions, f as formatMentionUsername } from "../../../../chunks/mentions.js";
async function findUsersByUsernamePattern(prisma, pattern, organizationId) {
  return prisma.user.findMany({
    where: {
      organizationId,
      OR: [
        { firstName: { contains: pattern, mode: "insensitive" } },
        { lastName: { contains: pattern, mode: "insensitive" } },
        { email: { contains: pattern, mode: "insensitive" } }
      ]
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true
    },
    take: 10
  });
}
async function queryMentionableUsers(prisma, organizationId) {
  return prisma.user.findMany({
    where: { organizationId, isActive: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true
    },
    orderBy: { firstName: "asc" }
  });
}
async function createMentionRecords(prisma, commentId, mentionedUserIds) {
  if (mentionedUserIds.length === 0)
    return [];
  const data = mentionedUserIds.map((mentionedUserId) => ({
    commentId,
    mentionedUserId
  }));
  return prisma.commentMention.createMany({
    data
  });
}
async function queryComments(prisma, workOrderId) {
  const comments = await prisma.workOrderComment.findMany({
    where: {
      workOrderId,
      isDeleted: false
    },
    select: {
      id: true,
      parentId: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      isEdited: true,
      editedAt: true,
      isDeleted: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      mentions: {
        include: {
          mentionedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: "asc" }
  });
  return buildCommentTree(comments);
}
function buildCommentTree(comments) {
  const commentMap = /* @__PURE__ */ new Map();
  const rootComments = [];
  comments.forEach((comment) => {
    const enriched = {
      ...comment,
      user: {
        ...comment.user,
        displayName: formatUserName(comment.user)
      },
      replies: [],
      depth: 0
    };
    commentMap.set(comment.id, enriched);
    if (!comment.parentId) {
      rootComments.push(enriched);
    }
  });
  comments.forEach((comment) => {
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      const child = commentMap.get(comment.id);
      if (parent && child) {
        parent.replies.push(child);
      }
    }
  });
  function calculateDepth(comment, currentDepth = 0) {
    comment.depth = currentDepth;
    comment.replies.forEach((reply) => calculateDepth(reply, currentDepth + 1));
  }
  rootComments.forEach((comment) => calculateDepth(comment));
  return rootComments;
}
async function createComment(event, prisma, data) {
  const { workOrderId, content, userId, parentId } = data;
  if (!content?.trim()) {
    return fail(400, { error: "Comment cannot be empty." });
  }
  if (content.length > MAX_COMMENT_LENGTH) {
    return fail(400, { error: `Comment is too long (max ${MAX_COMMENT_LENGTH} characters).` });
  }
  if (parentId) {
    const parentComment = await prisma.workOrderComment.findUnique({
      where: { id: parentId },
      include: { workOrder: true }
    });
    if (!parentComment) {
      return fail(404, { error: "Parent comment not found." });
    }
    if (parentComment.workOrderId !== workOrderId) {
      return fail(400, { error: "Parent comment belongs to a different work order." });
    }
    const depth = await getCommentDepth(prisma, parentId);
    if (depth >= MAX_COMMENT_DEPTH) {
      return fail(400, { error: `Maximum reply depth (${MAX_COMMENT_DEPTH}) reached.` });
    }
  }
  const workOrder = await prisma.workOrder.findUnique({
    where: { id: workOrderId },
    select: { organizationId: true }
  });
  if (!workOrder) {
    return fail(404, { error: "Work order not found." });
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true }
  });
  if (!user || user.organizationId !== workOrder.organizationId) {
    return fail(403, { error: "You do not have permission to comment on this work order." });
  }
  try {
    const comment = await prisma.workOrderComment.create({
      data: {
        content: content.trim(),
        workOrderId,
        userId,
        parentId: parentId || null
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    const mentionedUsernames = parseMentions(content);
    if (mentionedUsernames.length > 0) {
      const mentionedUsers = await findUsersByUsernamePattern(
        prisma,
        // Use first username as hint (could improve to match all)
        mentionedUsernames[0],
        workOrder.organizationId
      );
      const matchedUsers = mentionedUsers.filter((u) => {
        const username = [u.firstName, u.lastName].filter(Boolean).join("").toLowerCase().replace(/\s+/g, "");
        return mentionedUsernames.includes(username);
      });
      if (matchedUsers.length > 0) {
        await createMentionRecords(
          prisma,
          comment.id,
          matchedUsers.map((u) => u.id)
        );
      }
    }
    broadcastToOrg(workOrder.organizationId, {
      type: "WO_COMMENT_ADDED",
      payload: {
        workOrderId,
        commentId: comment.id,
        comment: {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          userId: comment.userId,
          userName: formatUserName(comment.user),
          parentId: comment.parentId
        }
      }
    });
    await logAudit(userId, "WORK_ORDER_COMMENT_ADDED", {
      workOrderId,
      commentId: comment.id,
      hasParent: !!comment.parentId
    });
    return { success: true, comment };
  } catch (e) {
    logError("Error creating comment", e, { workOrderId });
    return fail(500, { error: "Failed to create comment." });
  }
}
async function getCommentDepth(prisma, commentId) {
  let depth = 0;
  let currentId = commentId;
  while (currentId) {
    const comment = await prisma.workOrderComment.findUnique({
      where: { id: currentId },
      select: { parentId: true }
    });
    if (!comment)
      break;
    if (!comment.parentId)
      break;
    depth++;
    currentId = comment.parentId;
  }
  return depth;
}
async function updateComment(event, prisma, commentId, userId, newContent) {
  if (!newContent?.trim()) {
    return fail(400, { error: "Comment cannot be empty." });
  }
  if (newContent.length > MAX_COMMENT_LENGTH) {
    return fail(400, { error: `Comment is too long (max ${MAX_COMMENT_LENGTH} characters).` });
  }
  const existingComment = await prisma.workOrderComment.findUnique({
    where: { id: commentId },
    include: { workOrder: true }
  });
  if (!existingComment) {
    return fail(404, { error: "Comment not found." });
  }
  if (existingComment.userId !== userId) {
    return fail(403, { error: "You can only edit your own comments." });
  }
  if (existingComment.isDeleted) {
    return fail(400, { error: "Cannot edit a deleted comment." });
  }
  try {
    await prisma.commentEdit.create({
      data: {
        content: existingComment.content,
        commentId,
        userId
      }
    });
    const updated = await prisma.workOrderComment.update({
      where: { id: commentId },
      data: {
        content: newContent.trim(),
        isEdited: true,
        editedAt: /* @__PURE__ */ new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    await prisma.commentMention.deleteMany({
      where: { commentId }
    });
    const mentionedUsernames = parseMentions(newContent);
    if (mentionedUsernames.length > 0) {
      const matchedUsers = await findUsersByUsernamePattern(
        prisma,
        mentionedUsernames[0],
        existingComment.workOrder.organizationId
      );
      const exactMatches = matchedUsers.filter((u) => {
        const username = [u.firstName, u.lastName].filter(Boolean).join("").toLowerCase().replace(/\s+/g, "");
        return mentionedUsernames.includes(username);
      });
      if (exactMatches.length > 0) {
        await createMentionRecords(
          prisma,
          commentId,
          exactMatches.map((u) => u.id)
        );
      }
    }
    broadcastToOrg(existingComment.workOrder.organizationId, {
      type: "WO_COMMENT_UPDATED",
      payload: {
        workOrderId: existingComment.workOrderId,
        commentId,
        content: newContent.trim()
      }
    });
    await logAudit(userId, "WORK_ORDER_COMMENT_EDITED", {
      workOrderId: existingComment.workOrderId,
      commentId
    });
    return { success: true, comment: updated };
  } catch (e) {
    logError("Error updating comment", e, { commentId });
    return fail(500, { error: "Failed to update comment." });
  }
}
async function deleteComment(event, prisma, commentId, userId) {
  const existingComment = await prisma.workOrderComment.findUnique({
    where: { id: commentId },
    include: { workOrder: true }
  });
  if (!existingComment) {
    return fail(404, { error: "Comment not found." });
  }
  if (existingComment.userId !== userId) {
    return fail(403, { error: "You can only delete your own comments." });
  }
  if (existingComment.isDeleted) {
    return fail(400, { error: "Comment is already deleted." });
  }
  try {
    await prisma.workOrderComment.update({
      where: { id: commentId },
      data: {
        isDeleted: true,
        content: "[deleted]"
      }
    });
    broadcastToOrg(existingComment.workOrder.organizationId, {
      type: "WO_COMMENT_DELETED",
      payload: {
        workOrderId: existingComment.workOrderId,
        commentId
      }
    });
    await logAudit(userId, "WORK_ORDER_COMMENT_DELETED", {
      workOrderId: existingComment.workOrderId,
      commentId,
      hadReplies: true
      // Could check, but not necessary for audit
    });
    return { success: true };
  } catch (e) {
    logError("Error deleting comment", e, { commentId });
    return fail(500, { error: "Failed to delete comment." });
  }
}
async function verifyWorkOrderAccess(prisma, workOrderId, userId, organizationId) {
  let workOrder;
  try {
    workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      select: { organizationId: true }
    });
  } catch (e) {
    logError("Failed to fetch work order for auth check", e, { workOrderId, userId });
    return fail(500, { error: "Failed to verify access. Please try again." });
  }
  if (!workOrder) {
    return fail(404, { error: "Work order not found." });
  }
  if (workOrder.organizationId !== organizationId) {
    const security = SecurityManager.getInstance();
    await security.logSecurityEvent({
      event: void 0,
      action: "CHECKLIST_ACCESS_DENIED",
      details: { workOrderId, reason: "Organization mismatch" },
      severity: "WARNING",
      userId
    });
    return fail(403, { error: "You do not have permission to modify this checklist." });
  }
  return workOrder;
}
async function queryChecklistItems(prisma, workOrderId) {
  return prisma.workOrderChecklistItem.findMany({
    where: { workOrderId },
    orderBy: { position: "asc" }
  });
}
async function createChecklistItem(prisma, workOrderId, title, userId, organizationId) {
  const authResult = await verifyWorkOrderAccess(prisma, workOrderId, userId, organizationId);
  if (authResult && "status" in authResult) {
    return authResult;
  }
  try {
    const maxPositionItem = await prisma.workOrderChecklistItem.findFirst({
      where: { workOrderId },
      orderBy: { position: "desc" },
      select: { position: true }
    });
    const newPosition = (maxPositionItem?.position ?? -1) + 1;
    const item = await prisma.workOrderChecklistItem.create({
      data: {
        workOrderId,
        title: title.trim(),
        position: newPosition
      }
    });
    return { success: true, item };
  } catch (e) {
    logError("Failed to create checklist item", e, { workOrderId, userId });
    return fail(500, { error: "Failed to create checklist item. Please try again." });
  }
}
async function toggleChecklistItem(prisma, itemId, isCompleted, userId, organizationId) {
  let item;
  try {
    item = await prisma.workOrderChecklistItem.findUnique({
      where: { id: itemId },
      select: { workOrderId: true }
    });
  } catch (e) {
    logError("Failed to fetch checklist item for auth check", e, { itemId, userId });
    return fail(500, { error: "Failed to verify access. Please try again." });
  }
  if (!item) {
    return fail(404, { error: "Checklist item not found." });
  }
  const authResult = await verifyWorkOrderAccess(prisma, item.workOrderId, userId, organizationId);
  if (authResult && "status" in authResult) {
    return authResult;
  }
  try {
    const updated = await prisma.workOrderChecklistItem.update({
      where: { id: itemId },
      data: { isCompleted }
    });
    return { success: true, item: updated };
  } catch (e) {
    logError("Failed to toggle checklist item", e, { itemId, userId });
    return fail(500, { error: "Failed to update checklist item. Please try again." });
  }
}
async function deleteChecklistItem(prisma, itemId, userId, organizationId) {
  let item;
  try {
    item = await prisma.workOrderChecklistItem.findUnique({
      where: { id: itemId },
      select: { workOrderId: true }
    });
  } catch (e) {
    logError("Failed to fetch checklist item for auth check", e, { itemId, userId });
    return fail(500, { error: "Failed to verify access. Please try again." });
  }
  if (!item) {
    return fail(404, { error: "Checklist item not found." });
  }
  const authResult = await verifyWorkOrderAccess(prisma, item.workOrderId, userId, organizationId);
  if (authResult && "status" in authResult) {
    return authResult;
  }
  try {
    await prisma.workOrderChecklistItem.delete({
      where: { id: itemId }
    });
    return { success: true };
  } catch (e) {
    logError("Failed to delete checklist item", e, { itemId, userId });
    return fail(500, { error: "Failed to delete checklist item. Please try again." });
  }
}
const load = async (event) => {
  requireAuth(event);
  const prisma = await createRequestPrisma(event);
  const { id } = event.params;
  const workOrder = await queryWorkOrderById(prisma, id);
  if (!workOrder) {
    throw error(404, "Work order not found");
  }
  const assets = await queryAssetsForDropdown(prisma, event.locals.user.organizationId);
  const comments = await queryComments(prisma, id);
  const statusHistory = await queryStatusHistory(prisma, id);
  const checklistItems = await queryChecklistItems(prisma, id);
  const organizationId = event.locals.user.organizationId;
  if (!organizationId) {
    throw error(400, "User must belong to an organization");
  }
  const mentionableUsers = await queryMentionableUsers(prisma, organizationId);
  const mentionableUsersWithUsername = mentionableUsers.map((u) => ({
    ...u,
    displayName: formatUserName(u),
    mentionUsername: formatMentionUsername(u)
  }));
  return {
    workOrder,
    assets,
    comments,
    statusHistory: formatStatusHistory(statusHistory),
    mentionableUsers: mentionableUsersWithUsername,
    checklistItems
  };
};
const actions = {
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
    const formData = await event.request.formData();
    const { id } = event.params;
    const newStatus = formData.get("status");
    const reason = formData.get("reason");
    if (!newStatus) {
      return fail(400, { error: "Status is required" });
    }
    const statusesRequiringReason = ["ON_HOLD", "COMPLETED", "CANCELLED"];
    if (statusesRequiringReason.includes(newStatus) && !reason?.trim()) {
      return fail(400, { error: "A reason is required for this status change." });
    }
    return updateWorkOrderStatus(event, prisma, id, newStatus, reason?.trim());
  },
  update: async (event) => {
    const security = SecurityManager.getInstance();
    const rateLimitResult = await security.checkRateLimit(
      { event, action: "work_order_update", userId: event.locals.user?.id },
      SECURITY_RATE_LIMITS.FORM
    );
    if (!rateLimitResult.success) {
      if (rateLimitResult.blocked) {
        return fail(429, { error: "Too many requests. Your IP has been temporarily blocked." });
      }
      return fail(429, { error: "Too many requests. Please try again later." });
    }
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const { id } = event.params;
    const title = formData.get("title");
    const description = formData.get("description");
    const assetId = formData.get("assetId");
    if (!title || title.trim() === "") {
      return fail(400, { error: "Title is required" });
    }
    if (!assetId) {
      return fail(400, { error: "Asset is required" });
    }
    return updateWorkOrderDetails(event, prisma, id, {
      title,
      description,
      assetId
    });
  },
  delete: async (event) => {
    const security = SecurityManager.getInstance();
    const rateLimitResult = await security.checkRateLimit(
      { event, action: "work_order_delete", userId: event.locals.user?.id },
      SECURITY_RATE_LIMITS.FORM
    );
    if (!rateLimitResult.success) {
      if (rateLimitResult.blocked) {
        return fail(429, { error: "Too many requests. Your IP has been temporarily blocked." });
      }
      return fail(429, { error: "Too many requests. Please try again later." });
    }
    const prisma = await createRequestPrisma(event);
    const { id } = event.params;
    const result = await deleteWorkOrder(event, prisma, id);
    if (typeof result === "object" && result !== null && "success" in result && result.success === true) {
      throw redirect(303, "/work-orders");
    }
    return result;
  },
  /**
   * Add a new comment
   */
  addComment: async (event) => {
    const security = SecurityManager.getInstance();
    const rateLimitResult = await security.checkRateLimit(
      { event, action: "work_order_comment_add", userId: event.locals.user?.id },
      SECURITY_RATE_LIMITS.FORM
    );
    if (!rateLimitResult.success) {
      if (rateLimitResult.blocked) {
        return fail(429, { error: "Too many requests. Your IP has been temporarily blocked." });
      }
      return fail(429, { error: "Too many requests. Please try again later." });
    }
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const { id } = event.params;
    const validation = validateInput(workOrderCommentSchema, {
      content: formData.get("content"),
      parentId: formData.get("parentId")
    });
    if (!validation.success) {
      const firstError = Object.values(validation.errors)[0];
      return fail(400, { error: firstError });
    }
    return createComment(event, prisma, {
      workOrderId: id,
      content: validation.data.content,
      userId: event.locals.user.id,
      parentId: validation.data.parentId
    });
  },
  /**
   * Update an existing comment
   */
  updateComment: async (event) => {
    const security = SecurityManager.getInstance();
    const rateLimitResult = await security.checkRateLimit(
      { event, action: "work_order_comment_update", userId: event.locals.user?.id },
      SECURITY_RATE_LIMITS.FORM
    );
    if (!rateLimitResult.success) {
      if (rateLimitResult.blocked) {
        return fail(429, { error: "Too many requests. Your IP has been temporarily blocked." });
      }
      return fail(429, { error: "Too many requests. Please try again later." });
    }
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const commentId = formData.get("commentId");
    if (!commentId) {
      return fail(400, { error: "Comment ID is required." });
    }
    const validation = validateInput(workOrderCommentSchema, {
      content: formData.get("content"),
      parentId: void 0
      // Not used for updates
    });
    if (!validation.success) {
      const firstError = Object.values(validation.errors)[0];
      return fail(400, { error: firstError });
    }
    return updateComment(event, prisma, commentId, event.locals.user.id, validation.data.content);
  },
  /**
   * Delete a comment
   */
  deleteComment: async (event) => {
    const security = SecurityManager.getInstance();
    const rateLimitResult = await security.checkRateLimit(
      { event, action: "work_order_comment_delete", userId: event.locals.user?.id },
      SECURITY_RATE_LIMITS.FORM
    );
    if (!rateLimitResult.success) {
      if (rateLimitResult.blocked) {
        return fail(429, { error: "Too many requests. Your IP has been temporarily blocked." });
      }
      return fail(429, { error: "Too many requests. Please try again later." });
    }
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const commentId = formData.get("commentId");
    if (!commentId) {
      return fail(400, { error: "Comment ID is required." });
    }
    return deleteComment(event, prisma, commentId, event.locals.user.id);
  },
  /**
   * Add a checklist item
   */
  addChecklistItem: async (event) => {
    const security = SecurityManager.getInstance();
    const rateLimitResult = await security.checkRateLimit(
      { event, action: "work_order_checklist_add", userId: event.locals.user?.id },
      SECURITY_RATE_LIMITS.FORM
    );
    if (!rateLimitResult.success) {
      if (rateLimitResult.blocked) {
        return fail(429, { error: "Too many requests. Your IP has been temporarily blocked." });
      }
      return fail(429, { error: "Too many requests. Please try again later." });
    }
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const { id } = event.params;
    const validation = validateInput(workOrderChecklistSchema, {
      title: formData.get("title")
    });
    if (!validation.success) {
      const firstError = Object.values(validation.errors)[0];
      return fail(400, { error: firstError });
    }
    const userId = event.locals.user.id;
    const organizationId = event.locals.user.organizationId;
    return createChecklistItem(prisma, id, validation.data.title, userId, organizationId);
  },
  /**
   * Toggle checklist item completion
   */
  toggleChecklistItem: async (event) => {
    const security = SecurityManager.getInstance();
    const rateLimitResult = await security.checkRateLimit(
      { event, action: "work_order_checklist_toggle", userId: event.locals.user?.id },
      SECURITY_RATE_LIMITS.FORM
    );
    if (!rateLimitResult.success) {
      if (rateLimitResult.blocked) {
        return fail(429, { error: "Too many requests. Your IP has been temporarily blocked." });
      }
      return fail(429, { error: "Too many requests. Please try again later." });
    }
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const itemId = formData.get("itemId");
    const isCompleted = formData.get("isCompleted") === "true";
    const userId = event.locals.user.id;
    const organizationId = event.locals.user.organizationId;
    if (!itemId) {
      return fail(400, { error: "Item ID is required." });
    }
    return toggleChecklistItem(prisma, itemId, isCompleted, userId, organizationId);
  },
  /**
   * Delete a checklist item
   */
  deleteChecklistItem: async (event) => {
    const security = SecurityManager.getInstance();
    const rateLimitResult = await security.checkRateLimit(
      { event, action: "work_order_checklist_delete", userId: event.locals.user?.id },
      SECURITY_RATE_LIMITS.FORM
    );
    if (!rateLimitResult.success) {
      if (rateLimitResult.blocked) {
        return fail(429, { error: "Too many requests. Your IP has been temporarily blocked." });
      }
      return fail(429, { error: "Too many requests. Please try again later." });
    }
    const prisma = await createRequestPrisma(event);
    const formData = await event.request.formData();
    const itemId = formData.get("itemId");
    const userId = event.locals.user.id;
    const organizationId = event.locals.user.organizationId;
    if (!itemId) {
      return fail(400, { error: "Item ID is required." });
    }
    return deleteChecklistItem(prisma, itemId, userId, organizationId);
  }
};
export {
  actions,
  load
};
