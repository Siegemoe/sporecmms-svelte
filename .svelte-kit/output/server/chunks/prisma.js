function isCloudflareWorker() {
  const g = globalThis;
  if (g.process?.env?.CF_PAGES || g.CF_PAGES) {
    return true;
  }
  return !g.process?.versions?.node && typeof g.fetch === "function" && !g.Buffer;
}
let cachedEnvVars;
function initEnvFromEvent(event) {
  if (event.platform?.env) {
    cachedEnvVars = event.platform.env;
  }
}
function getEnvVar(key) {
  const g = globalThis;
  if (cachedEnvVars && cachedEnvVars[key]) {
    return cachedEnvVars[key];
  }
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
      console.warn("Prisma client not available during build/SSR generation");
      return null;
    }
    throw new Error("DATABASE_URL, ACCELERATE_URL, or DIRECT_URL environment variable is required");
  }
  const nodeEnv = getEnvVar("NODE_ENV") || "development";
  const logLevel = nodeEnv === "development" ? ["query", "info", "warn", "error"] : ["warn", "error"];
  const { withAccelerate } = await import("@prisma/extension-accelerate");
  if (isCloudflareWorker()) {
    const { PrismaClient: EdgePrismaClient } = await import("@prisma/client/edge");
    const client = new EdgePrismaClient({
      log: logLevel,
      accelerateUrl: effectiveUrl
    });
    return client.$extends(withAccelerate());
  } else {
    const { PrismaClient: NodePrismaClient } = await import("@prisma/client");
    const client = new NodePrismaClient({
      // @ts-ignore - types might conflict but datasources is supported for Node client
      datasources: {
        db: {
          url: effectiveUrl
        }
      },
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
  if (!client) {
    throw new Error("Prisma client not available. This may occur during build/SSR generation.");
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = client;
  }
  return client;
}
const orgModels = ["WorkOrder", "User", "Site"];
async function createPrismaClient(organizationId) {
  const baseClient = await getPrismaSingleton();
  if (!organizationId) {
    return baseClient;
  }
  return baseClient.$extends({
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (orgModels.includes(model)) {
            args.where = { ...args.where, organizationId };
          }
          return query(args);
        },
        async findFirst({ model, args, query }) {
          if (orgModels.includes(model)) {
            args.where = { ...args.where, organizationId };
          }
          return query(args);
        },
        async findUnique({ model, args, query }) {
          const result = await query(args);
          if (result && orgModels.includes(model) && result.organizationId !== organizationId) {
            return null;
          }
          return result;
        },
        async update({ model, args, query }) {
          if (orgModels.includes(model)) {
            args.where = { ...args.where, organizationId };
          }
          return query(args);
        },
        async delete({ model, args, query }) {
          if (orgModels.includes(model)) {
            args.where = { ...args.where, organizationId };
          }
          return query(args);
        },
        async create({ model, args, query }) {
          if (orgModels.includes(model)) {
            args.data = { ...args.data, organizationId };
          }
          return query(args);
        }
      }
    }
  });
}
async function createRequestPrisma(event) {
  const organizationId = event.locals.user?.organizationId ?? void 0;
  if (isCloudflareWorker() && event.platform?.env) {
    return createPrismaClient(organizationId);
  }
  return createPrismaClient(organizationId);
}
async function getPrisma() {
  return getPrismaSingleton();
}
export {
  createRequestPrisma as c,
  getPrisma as g,
  initEnvFromEvent as i
};
