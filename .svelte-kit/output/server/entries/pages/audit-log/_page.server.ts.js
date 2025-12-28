import { i as initEnvFromEvent, g as getPrisma } from "../../../chunks/prisma.js";
import { e as error } from "../../../chunks/index.js";
import { a as isAdmin } from "../../../chunks/guards.js";
const load = async (event) => {
  initEnvFromEvent(event);
  if (!isAdmin(event)) {
    throw error(403, "Access denied. Admin privileges required.");
  }
  const organizationId = event.locals.user.organizationId;
  const page = parseInt(event.url.searchParams.get("page") || "1");
  const limit = 50;
  const skip = (page - 1) * limit;
  const client = await getPrisma();
  const userIdsInOrg = await client.user.findMany({
    where: { organizationId: organizationId ?? void 0 },
    select: { id: true }
  }).then((users) => users.map((u) => u.id));
  const auditLogs = await client.auditLog.findMany({
    where: {
      userId: { in: userIdsInOrg }
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
    include: {
      User: {
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
      userId: { in: userIdsInOrg }
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
