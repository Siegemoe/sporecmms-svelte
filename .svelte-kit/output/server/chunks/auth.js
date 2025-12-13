import bcrypt from "bcryptjs";
import { p as prisma } from "./prisma.js";
const SESSION_COOKIE = "spore_session";
const SESSION_EXPIRY_DAYS = 30;
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
async function createSession(userId) {
  try {
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);
    const client = await prisma;
    const session = await client.session.create({
      data: {
        userId,
        expiresAt
      }
    });
    return session.id;
  } catch (error) {
    console.error("Failed to create session:", error);
    throw new Error("Failed to create session");
  }
}
async function validateSession(cookies) {
  const sessionId = cookies.get(SESSION_COOKIE);
  if (!sessionId) {
    return null;
  }
  const client = await prisma;
  const session = await client.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          orgId: true
        }
      }
    }
  });
  if (!session) {
    return null;
  }
  if (session.expiresAt < /* @__PURE__ */ new Date()) {
    await client.session.delete({ where: { id: sessionId } });
    return null;
  }
  return session.user;
}
async function destroySession(cookies) {
  const sessionId = cookies.get(SESSION_COOKIE);
  if (sessionId) {
    const client = await prisma;
    await client.session.delete({ where: { id: sessionId } }).catch(() => {
    });
    cookies.delete(SESSION_COOKIE, { path: "/" });
  }
}
function setSessionCookie(cookies, sessionId) {
  cookies.set(SESSION_COOKIE, sessionId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: globalThis.process?.env?.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * SESSION_EXPIRY_DAYS
  });
}
function canManageUsers(role) {
  return role === "ADMIN";
}
export {
  canManageUsers as a,
  validateSession as b,
  createSession as c,
  destroySession as d,
  hashPassword as h,
  setSessionCookie as s,
  verifyPassword as v
};
