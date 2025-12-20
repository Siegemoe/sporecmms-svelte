import bcrypt from "bcryptjs";
import { g as getPrisma } from "./prisma.js";
import { D as DEV } from "./true.js";
const dev = DEV;
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
    const client = await getPrisma();
    const session = await client.session.create({
      data: {
        userId,
        expiresAt,
        token: crypto.randomUUID()
      }
    });
    return session.id;
  } catch (error) {
    console.error("Failed to create session:", error);
    throw new Error("Failed to create session");
  }
}
async function validateSessionWithOrg(cookies) {
  const sessionId = cookies.get(SESSION_COOKIE);
  if (!sessionId) {
    return { user: null, state: "unauthenticated" };
  }
  const client = await getPrisma();
  const session = await client.session.findUnique({
    where: { id: sessionId },
    include: {
      User: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          organizationId: true,
          Organization: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });
  if (!session) {
    return { user: null, state: "unauthenticated" };
  }
  if (session.expiresAt < /* @__PURE__ */ new Date()) {
    await client.session.delete({ where: { id: sessionId } });
    return { user: null, state: "unauthenticated" };
  }
  const user = session.User;
  if (!user.organizationId) {
    return { user, state: "lobby" };
  }
  const userOrgs = await client.organization.findMany({
    where: {
      User: {
        some: {
          id: user.id
        }
      }
    },
    select: {
      id: true,
      name: true
    }
  });
  return {
    user,
    state: "org_member",
    organizations: userOrgs,
    currentOrganization: user.Organization
  };
}
async function destroySession(cookies) {
  const sessionId = cookies.get(SESSION_COOKIE);
  if (sessionId) {
    const client = await getPrisma();
    await client.session.delete({ where: { id: sessionId } }).catch(() => {
    });
    cookies.delete(SESSION_COOKIE, { path: "/" });
  }
}
function setSessionCookie(cookies, sessionId) {
  cookies.set(SESSION_COOKIE, sessionId, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    // Upgrade from 'lax' for better security
    secure: !dev,
    // Always secure in production (Cloudflare Pages enforces HTTPS)
    maxAge: 60 * 60 * 24 * SESSION_EXPIRY_DAYS
  });
}
function canManageUsers(role) {
  return role === "ADMIN";
}
async function validateResetToken(token) {
  const client = await getPrisma();
  const user = await client.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpiresAt: {
        gt: /* @__PURE__ */ new Date()
      }
    },
    select: {
      id: true,
      email: true
    }
  });
  return user;
}
async function resetPassword(token, newPassword) {
  const client = await getPrisma();
  const user = await validateResetToken(token);
  if (!user) {
    throw new Error("Invalid or expired reset token");
  }
  const hashedPassword = await hashPassword(newPassword);
  await client.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiresAt: null
    }
  });
  return user;
}
export {
  validateResetToken as a,
  canManageUsers as b,
  createSession as c,
  destroySession as d,
  validateSessionWithOrg as e,
  hashPassword as h,
  resetPassword as r,
  setSessionCookie as s,
  verifyPassword as v
};
