import { c as createRequestPrisma } from "../../../chunks/prisma.js";
import { b as canManageUsers, h as hashPassword } from "../../../chunks/auth.js";
import { e as error, f as fail } from "../../../chunks/index.js";
import { l as logAudit } from "../../../chunks/audit.js";
const load = async (event) => {
  const { locals } = event;
  if (!locals.user || !canManageUsers(locals.user.role)) {
    throw error(403, "Access denied. Admin privileges required.");
  }
  const prisma = await createRequestPrisma(event);
  const users = await prisma.user.findMany({
    where: { organizationId: locals.user.organizationId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true
    }
  });
  return { users };
};
const actions = {
  create: async (event) => {
    const { locals, request } = event;
    if (!locals.user || !canManageUsers(locals.user.role)) {
      return fail(403, { error: "Access denied" });
    }
    const prisma = await createRequestPrisma(event);
    const formData = await request.formData();
    const email = formData.get("email");
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const role = formData.get("role");
    const password = formData.get("password");
    if (!email?.trim()) {
      return fail(400, { error: "Email is required" });
    }
    if (!password || password.length < 8) {
      return fail(400, { error: "Password must be at least 8 characters" });
    }
    if (!["ADMIN", "MANAGER", "TECHNICIAN"].includes(role)) {
      return fail(400, { error: "Invalid role" });
    }
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    if (existing) {
      return fail(400, { error: "Email already in use" });
    }
    const hashedPassword = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        role,
        organizationId: locals.user.organizationId,
        updatedAt: /* @__PURE__ */ new Date()
      }
    });
    await logAudit(locals.user.id, "USER_CREATED", {
      newUserId: newUser.id,
      email: newUser.email,
      role
    });
    return { success: true };
  },
  updateRole: async (event) => {
    const { locals, request } = event;
    if (!locals.user || !canManageUsers(locals.user.role)) {
      return fail(403, { error: "Access denied" });
    }
    const prisma = await createRequestPrisma(event);
    const formData = await request.formData();
    const userId = formData.get("userId");
    const role = formData.get("role");
    if (!userId)
      return fail(400, { error: "User ID required" });
    if (!["ADMIN", "MANAGER", "TECHNICIAN"].includes(role)) {
      return fail(400, { error: "Invalid role" });
    }
    if (userId === locals.user.id) {
      return fail(400, { error: "Can't change your own role" });
    }
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true }
    });
    await prisma.user.updateMany({
      where: { id: userId, organizationId: locals.user.organizationId },
      data: { role }
    });
    await logAudit(locals.user.id, "USER_ROLE_CHANGED", {
      targetUserId: userId,
      email: targetUser?.email,
      oldRole: targetUser?.role,
      newRole: role
    });
    return { success: true };
  },
  delete: async (event) => {
    const { locals, request } = event;
    if (!locals.user || !canManageUsers(locals.user.role)) {
      return fail(403, { error: "Access denied" });
    }
    const prisma = await createRequestPrisma(event);
    const formData = await request.formData();
    const userId = formData.get("userId");
    if (!userId)
      return fail(400, { error: "User ID required" });
    if (userId === locals.user.id) {
      return fail(400, { error: "Can't delete your own account" });
    }
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });
    await prisma.user.deleteMany({
      where: { id: userId, organizationId: locals.user.organizationId }
    });
    await logAudit(locals.user.id, "USER_DELETED", {
      deletedUserId: userId,
      email: targetUser?.email
    });
    return { success: true };
  }
};
export {
  actions,
  load
};
