import { p as prisma } from "../../../chunks/prisma.js";
import { e as error } from "../../../chunks/index.js";
import { a as isAdmin } from "../../../chunks/guards.js";
const load = async (event) => {
  if (!isAdmin(event)) {
    throw error(403, "Access denied. Admin privileges required.");
  }
  const orgId = event.locals.user.orgId;
  const page = parseInt(event.url.searchParams.get("page") || "1");
  const limit = 50;
  const skip = (page - 1) * limit;
  const client = await prisma;
  const auditLogs = await client.auditLog.findMany({
    where: {
      user: { orgId }
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });
  const totalCount = await client.auditLog.count({
    where: {
      user: { orgId }
    }
  });
  const totalPages = Math.ceil(totalCount / limit);
  return {
    auditLogs,
    page,
    totalPages,
    totalCount
  };
};
export {
  load
};
