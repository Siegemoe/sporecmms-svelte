import { c as createRequestPrisma } from "../../../chunks/prisma.js";
import { v as verifyPassword, h as hashPassword } from "../../../chunks/auth.js";
import { r as requireAuth } from "../../../chunks/guards.js";
import { f as fail } from "../../../chunks/index.js";
const load = async (event) => {
  requireAuth(event);
  const prisma = await createRequestPrisma(event);
  const userId = event.locals.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      role: true,
      createdAt: true
    }
  });
  return { profile: user };
};
const actions = {
  updateProfile: async (event) => {
    requireAuth(event);
    const prisma = await createRequestPrisma(event);
    const userId = event.locals.user.id;
    const formData = await event.request.formData();
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const phoneNumber = formData.get("phoneNumber");
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        phoneNumber: phoneNumber?.trim() || null
      }
    });
    return { success: true, message: "Profile updated successfully" };
  },
  changePassword: async (event) => {
    requireAuth(event);
    const prisma = await createRequestPrisma(event);
    const userId = event.locals.user.id;
    const formData = await event.request.formData();
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");
    if (!currentPassword || !newPassword || !confirmPassword) {
      return fail(400, { passwordError: "All password fields are required" });
    }
    if (newPassword.length < 8) {
      return fail(400, { passwordError: "New password must be at least 8 characters" });
    }
    if (newPassword !== confirmPassword) {
      return fail(400, { passwordError: "New passwords do not match" });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });
    if (!user) {
      return fail(400, { passwordError: "User not found" });
    }
    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return fail(400, { passwordError: "Current password is incorrect" });
    }
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    return { passwordSuccess: true, message: "Password changed successfully" };
  }
};
export {
  actions,
  load
};
