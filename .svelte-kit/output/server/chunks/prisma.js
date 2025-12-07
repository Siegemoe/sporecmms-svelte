import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
const globalForPrisma = globalThis;
const prismaSingleton = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["warn", "error"]
}).$extends(withAccelerate());
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaSingleton;
}
const orgModels = ["WorkOrder", "User", "Site"];
function createPrismaClient(orgId) {
  if (!orgId) {
    return prismaSingleton;
  }
  return prismaSingleton.$extends({
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (orgModels.includes(model)) {
            args.where = { ...args.where, orgId };
          }
          return query(args);
        },
        async findFirst({ model, args, query }) {
          if (orgModels.includes(model)) {
            args.where = { ...args.where, orgId };
          }
          return query(args);
        },
        async findUnique({ model, args, query }) {
          const result = await query(args);
          if (result && orgModels.includes(model) && result.orgId !== orgId) {
            return null;
          }
          return result;
        },
        async update({ model, args, query }) {
          if (orgModels.includes(model)) {
            args.where = { ...args.where, orgId };
          }
          return query(args);
        },
        async delete({ model, args, query }) {
          if (orgModels.includes(model)) {
            args.where = { ...args.where, orgId };
          }
          return query(args);
        },
        async create({ model, args, query }) {
          if (orgModels.includes(model)) {
            args.data = { ...args.data, orgId };
          }
          return query(args);
        }
      }
    }
  });
}
function createRequestPrisma(event) {
  const orgId = event.locals.user?.orgId;
  return createPrismaClient(orgId);
}
const prisma = prismaSingleton;
export {
  createRequestPrisma as c,
  prisma as p
};
