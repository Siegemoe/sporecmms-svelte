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
  const expiresAt = /* @__PURE__ */ new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);
  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt
    }
  });
  return session.id;
}
async function validateSession(cookies) {
  const sessionId = cookies.get(SESSION_COOKIE);
  if (!sessionId) {
    return null;
  }
  const session = await prisma.session.findUnique({
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
    await prisma.session.delete({ where: { id: sessionId } });
    return null;
  }
  return session.user;
}
async function destroySession(cookies) {
  const sessionId = cookies.get(SESSION_COOKIE);
  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {
    });
    cookies.delete(SESSION_COOKIE, { path: "/" });
  }
}
function setSessionCookie(cookies, sessionId) {
  cookies.set(SESSION_COOKIE, sessionId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
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
