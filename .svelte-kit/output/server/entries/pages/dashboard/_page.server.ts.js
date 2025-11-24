import { c as createRequestPrisma } from "../../../chunks/prisma.js";
import { r as requireAuth } from "../../../chunks/guards.js";
const load = async (event) => {
  requireAuth(event);
  const prisma = createRequestPrisma(event);
  const [total, pending, inProgress, completed] = await Promise.all([
    prisma.workOrder.count(),
    prisma.workOrder.count({ where: { status: "PENDING" } }),
    prisma.workOrder.count({ where: { status: "IN_PROGRESS" } }),
    prisma.workOrder.count({ where: { status: "COMPLETED" } })
  ]);
  const recentWorkOrders = await prisma.workOrder.findMany({
    take: 5,
    orderBy: { updatedAt: "desc" },
    include: {
      asset: {
        include: {
          room: {
            select: {
              name: true,
              building: true,
              floor: true,
              site: {
                select: { name: true }
              }
            }
          }
        }
      }
    }
  });
  const sites = await prisma.site.findMany({
    include: {
      _count: {
        select: { rooms: true }
      }
    }
  });
  return {
    stats: { total, pending, inProgress, completed },
    recentWorkOrders,
    sites
  };
};
export {
  load
};
