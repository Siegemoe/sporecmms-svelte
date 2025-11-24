import { r as redirect, f as fail } from "../../../../chunks/index.js";
import { v as verifyPassword, c as createSession, s as setSessionCookie } from "../../../../chunks/auth.js";
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
    const email = formData.get("email");
    const password = formData.get("password");
    if (!email || !password) {
      return fail(400, { error: "Email and password are required", email });
    }
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    if (!user) {
      return fail(400, { error: "Invalid email or password", email });
    }
    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return fail(400, { error: "Invalid email or password", email });
    }
    const sessionId = await createSession(user.id);
    setSessionCookie(cookies, sessionId);
    throw redirect(303, "/dashboard");
  }
};
export {
  actions,
  load
};
