import { r as redirect, f as fail } from "../../../../chunks/index.js";
import { h as hashPassword, c as createSession, s as setSessionCookie } from "../../../../chunks/auth.js";
import { p as prisma } from "../../../../chunks/prisma.js";
const load = async ({ locals }) => {
  if (locals.user) {
    throw redirect(303, "/dashboard");
  }
  return {};
};
const actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const orgName = formData.get("orgName");
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");
    if (!orgName?.trim()) {
      return fail(400, { error: "Organization name is required", orgName, firstName, lastName, email });
    }
    if (!firstName?.trim()) {
      return fail(400, { error: "First name is required", orgName, firstName, lastName, email });
    }
    if (!email?.trim()) {
      return fail(400, { error: "Email is required", orgName, firstName, lastName, email });
    }
    if (!password || password.length < 8) {
      return fail(400, { error: "Password must be at least 8 characters", orgName, firstName, lastName, email });
    }
    if (password !== confirmPassword) {
      return fail(400, { error: "Passwords do not match", orgName, firstName, lastName, email });
    }
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    if (existingUser) {
      return fail(400, { error: "An account with this email already exists", orgName, firstName, lastName, email });
    }
    const hashedPassword = await hashPassword(password);
    const { user } = await prisma.$transaction(async (tx) => {
      const org = await tx.org.create({
        data: { name: orgName.trim() }
      });
      const user2 = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          firstName: firstName.trim(),
          lastName: lastName?.trim() || null,
          role: "ADMIN",
          orgId: org.id
        }
      });
      return { org, user: user2 };
    });
    const sessionId = await createSession(user.id);
    setSessionCookie(cookies, sessionId);
    throw redirect(303, "/dashboard");
  }
};
export {
  actions,
  load
};
