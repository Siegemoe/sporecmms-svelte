import { r as redirect, e as error, f as fail } from "../../../../chunks/index.js";
import { h as hashPassword, c as createSession, s as setSessionCookie } from "../../../../chunks/auth.js";
import { g as getPrisma } from "../../../../chunks/prisma.js";
import { c as checkRateLimit, R as RATE_LIMITS, v as validateInput, r as registerSchema } from "../../../../chunks/rateLimit.js";
const load = async ({ locals }) => {
  if (locals.user) {
    throw redirect(303, "/dashboard");
  }
  return {};
};
const actions = {
  default: async ({ request, cookies, getClientAddress }) => {
    try {
      const ip = getClientAddress() || "unknown";
      const rateLimitResult = checkRateLimit(
        `register:${ip}`,
        RATE_LIMITS.AUTH.limit,
        RATE_LIMITS.AUTH.windowMs
      );
      if (!rateLimitResult.success) {
        throw error(429, "Too many registration attempts. Please try again later.");
      }
      const formData = await request.formData();
      const confirmPassword = formData.get("confirmPassword");
      const validation = validateInput(registerSchema, {
        orgName: formData.get("orgName"),
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        password: formData.get("password")
      });
      if (!validation.success) {
        const firstError = Object.values(validation.errors)[0];
        return fail(400, {
          error: firstError,
          orgName: formData.get("orgName"),
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: formData.get("email")
        });
      }
      if (validation.data.password !== confirmPassword) {
        return fail(400, {
          error: "Passwords do not match",
          orgName: formData.get("orgName"),
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: formData.get("email")
        });
      }
      const client = await getPrisma();
      const existingUser = await client.user.findUnique({
        where: { email: validation.data.email }
      });
      if (existingUser) {
        return fail(400, {
          error: "An account with this email already exists",
          orgName: formData.get("orgName"),
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: formData.get("email")
        });
      }
      const hashedPassword = await hashPassword(validation.data.password);
      const { user } = await client.$transaction(async (tx) => {
        const org = await tx.org.create({
          data: { name: validation.data.orgName }
        });
        const user2 = await tx.user.create({
          data: {
            email: validation.data.email,
            password: hashedPassword,
            firstName: validation.data.firstName,
            lastName: validation.data.lastName,
            role: "ADMIN",
            orgId: org.id
          }
        });
        return { org, user: user2 };
      });
      const sessionId = await createSession(user.id);
      setSessionCookie(cookies, sessionId);
      throw redirect(303, "/dashboard");
    } catch (error2) {
      console.error("[REGISTER] Error:", error2);
      console.error("[REGISTER] Stack:", error2.stack);
      return fail(500, {
        error: "Internal server error during registration. Please try again.",
        details: error2.message
      });
    }
  }
};
export {
  actions,
  load
};
