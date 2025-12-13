import { r as redirect, e as error, f as fail } from "../../../../chunks/index.js";
import { v as verifyPassword, c as createSession, s as setSessionCookie } from "../../../../chunks/auth.js";
import { g as getPrisma } from "../../../../chunks/prisma.js";
import { c as checkRateLimit, R as RATE_LIMITS, v as validateInput, l as loginSchema } from "../../../../chunks/rateLimit.js";
const load = async ({ locals }) => {
  if (locals.user) {
    throw redirect(303, "/dashboard");
  }
  return {};
};
const actions = {
  default: async ({ request, cookies, getClientAddress }) => {
    let formData;
    try {
      const ip = getClientAddress() || "unknown";
      const rateLimitResult = checkRateLimit(
        `login:${ip}`,
        RATE_LIMITS.AUTH.limit,
        RATE_LIMITS.AUTH.windowMs
      );
      if (!rateLimitResult.success) {
        throw error(429, "Too many login attempts. Please try again later.");
      }
      formData = await request.formData();
      const validation = validateInput(loginSchema, {
        email: formData.get("email"),
        password: formData.get("password")
      });
      if (!validation.success) {
        const firstError = Object.values(validation.errors)[0];
        return fail(400, { error: firstError, email: formData.get("email") });
      }
      const client = await getPrisma();
      const user = await client.user.findUnique({
        where: { email: validation.data.email }
      });
      if (!user) {
        return fail(400, { error: "Invalid email or password", email: formData.get("email") });
      }
      const valid = await verifyPassword(validation.data.password, user.password);
      if (!valid) {
        return fail(400, { error: "Invalid email or password", email: formData.get("email") });
      }
      const sessionId = await createSession(user.id);
      setSessionCookie(cookies, sessionId);
      throw redirect(303, "/dashboard");
    } catch (error2) {
      if (error2 && typeof error2 === "object" && "location" in error2) {
        throw error2;
      }
      console.error("Login error:", error2);
      const emailValue = formData?.get("email");
      return fail(500, {
        error: "An unexpected error occurred. Please try again.",
        email: emailValue
      });
    }
  }
};
export {
  actions,
  load
};
