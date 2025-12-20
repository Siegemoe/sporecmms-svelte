import { r as redirect, f as fail } from "../../../../chunks/index.js";
import { v as verifyPassword, c as createSession, s as setSessionCookie } from "../../../../chunks/auth.js";
import { g as getPrisma } from "../../../../chunks/prisma.js";
import { v as validateInput, l as loginSchema } from "../../../../chunks/validation.js";
import { a as SECURITY_RATE_LIMITS, S as SecurityManager } from "../../../../chunks/security.js";
const load = async ({ locals }) => {
  if (locals.user) {
    throw redirect(303, "/dashboard");
  }
  return {};
};
const actions = {
  default: async ({ request, cookies, getClientAddress }) => {
    let formData;
    const security = SecurityManager.getInstance();
    const ip = getClientAddress() || "unknown";
    try {
      const blockStatus = await security.isIPBlocked(ip);
      if (blockStatus.blocked) {
        await security.logSecurityEvent({
          ipAddress: ip,
          action: "LOGIN_BLOCKED",
          details: { reason: blockStatus.reason },
          severity: "WARNING"
        });
        return fail(403, { error: "Access denied. Your IP address has been blocked." });
      }
      const rateLimitResult = await security.checkRateLimit(
        { event: { request, getClientAddress: () => ip }, action: "login" },
        SECURITY_RATE_LIMITS.AUTH
      );
      if (!rateLimitResult.success) {
        if (rateLimitResult.blocked) {
          await security.logSecurityEvent({
            ipAddress: ip,
            action: "LOGIN_BLOCKED",
            details: { reason: "Too many login attempts" },
            severity: "WARNING"
          });
          return fail(429, { error: "Too many login attempts. Your IP has been temporarily blocked." });
        }
        return fail(429, { error: "Too many login attempts. Please try again later." });
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
      console.log(`[Auth Debug] User lookup for ${validation.data.email}:`, user ? "Found" : "Not Found");
      if (!user) {
        await security.logSecurityEvent({
          ipAddress: ip,
          action: "LOGIN_FAILED",
          details: { email: validation.data.email, reason: "User not found" },
          severity: "WARNING"
        });
        return fail(400, { error: "Invalid email or password", email: formData.get("email") });
      }
      const valid = await verifyPassword(validation.data.password, user.password);
      console.log(`[Auth Debug] Password verification for ${validation.data.email}:`, valid ? "Valid" : "Invalid");
      if (!valid) {
        await security.logSecurityEvent({
          ipAddress: ip,
          action: "LOGIN_FAILED",
          details: { email: validation.data.email, userId: user.id, reason: "Invalid password" },
          severity: "WARNING",
          userId: user.id
        });
        return fail(400, { error: "Invalid email or password", email: formData.get("email") });
      }
      const sessionId = await createSession(user.id);
      setSessionCookie(cookies, sessionId);
      await security.logSecurityEvent({
        ipAddress: ip,
        action: "LOGIN_SUCCESS",
        details: { email: user.email },
        severity: "INFO",
        userId: user.id
      });
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
