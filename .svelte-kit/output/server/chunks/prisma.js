function isCloudflareWorker() {
  const g = globalThis;
  return !g.process?.versions?.node && typeof g.fetch === "function" && !g.Buffer;
}
function getEnvVar(key) {
  const g = globalThis;
  if (g[key]) {
    return g[key];
  }
  if (g.platform?.env?.[key]) {
    return g.platform.env[key];
  }
  return g.process?.env?.[key];
}
async function createBasePrismaClient() {
  const databaseUrl = getEnvVar("DATABASE_URL");
  const accelerateUrl = getEnvVar("ACCELERATE_URL");
  const directUrl = getEnvVar("DIRECT_URL");
  const effectiveUrl = accelerateUrl || databaseUrl || directUrl;
  if (!effectiveUrl) {
    if (typeof globalThis !== "undefined" && globalThis.__SVELTEKIT__) {
      const { PrismaClient } = await import("@prisma/client");
      return new PrismaClient({
        datasources: {
          db: {
            url: "postgresql://localhost:5432/dummy"
          }
        }
      });
    }
    throw new Error("DATABASE_URL, ACCELERATE_URL, or DIRECT_URL environment variable is required");
  }
  const nodeEnv = getEnvVar("NODE_ENV") || "development";
  const logLevel = nodeEnv === "development" ? ["query", "info", "warn", "error"] : ["warn", "error"];
  const { withAccelerate } = await import("@prisma/extension-accelerate");
  if (isCloudflareWorker()) {
    const { PrismaClient: EdgePrismaClient } = await import("@prisma/client/edge");
    const client = new EdgePrismaClient({
      accelerateUrl: effectiveUrl,
      log: logLevel
    });
    return client.$extends(withAccelerate());
  } else {
    const { PrismaClient: NodePrismaClient } = await import("@prisma/client");
    const client = new NodePrismaClient({
      accelerateUrl: effectiveUrl,
      log: logLevel
    });
    return client.$extends(withAccelerate());
  }
}
const globalForPrisma = globalThis;
async function getPrismaSingleton() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }
  if (!globalForPrisma.prismaPromise) {
    globalForPrisma.prismaPromise = createBasePrismaClient();
  }
  const client = await globalForPrisma.prismaPromise;
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = client;
  }
  return client;
}
const orgModels = ["WorkOrder", "User", "Site"];
async function createPrismaClient(orgId) {
  const baseClient = await getPrismaSingleton();
  if (!orgId) {
    return baseClient;
  }
  return baseClient.$extends({
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
async function createRequestPrisma(event) {
  const orgId = event.locals.user?.orgId;
  if (isCloudflareWorker() && event.platform?.env) {
    return createPrismaClient(orgId);
  }
  return createPrismaClient(orgId);
}
async function getPrisma() {
  return getPrismaSingleton();
}
export {
  createRequestPrisma as c,
  getPrisma as g
};
