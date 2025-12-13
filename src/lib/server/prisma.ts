import type { RequestEvent } from '@sveltejs/kit';
import type { PrismaClient } from '@prisma/client';

// Runtime detection helper
function isCloudflareWorker(): boolean {
  // Check for Cloudflare Worker runtime environment
  const g = globalThis as any;
  return !(g.process?.versions?.node) &&
         typeof g.fetch === 'function' &&
         !g.Buffer;
}

// Helper to get environment variables reliably
function getEnvVar(key: string): string | undefined {
  const g = globalThis as any;

  // Try Cloudflare Workers secrets/bindings first
  if (g[key]) {
    return g[key];
  }

  // Try platform env (Cloudflare Pages/Workers)
  if (g.platform?.env?.[key]) {
    return g.platform.env[key];
  }

  // Fallback to process.env (Node.js)
  return g.process?.env?.[key];
}

// Create appropriate Prisma client based on runtime
async function createBasePrismaClient(): Promise<PrismaClient> {
  // Get database URLs from environment
  const databaseUrl = getEnvVar('DATABASE_URL');
  const accelerateUrl = getEnvVar('ACCELERATE_URL');
  const directUrl = getEnvVar('DIRECT_URL');

  // Determine which URL to use
  const effectiveUrl = accelerateUrl || databaseUrl || directUrl;

  if (!effectiveUrl) {
    throw new Error('DATABASE_URL, ACCELERATE_URL, or DIRECT_URL environment variable is required');
  }

  // Common logging configuration - temporarily enable all logs for debugging
  const nodeEnv = getEnvVar('NODE_ENV') || 'development';
  const logLevel = ['query', 'info', 'warn', 'error']; // Enable all logs temporarily

  if (isCloudflareWorker()) {
    // Cloudflare Worker environment - use edge client with Accelerate extension
    const { PrismaClient: EdgePrismaClient } = await import('@prisma/client/edge');
    const { withAccelerate } = await import('@prisma/extension-accelerate');

    const client = new EdgePrismaClient({
      datasources: {
        db: {
          url: effectiveUrl
        }
      },
      log: logLevel as any,
    });

    return client.$extends(withAccelerate()) as PrismaClient;
  } else {
    // Node.js environment - use standard client
    const { PrismaClient: NodePrismaClient } = await import('@prisma/client');
    const { withAccelerate } = await import('@prisma/extension-accelerate');

    const client = new NodePrismaClient({
      datasources: {
        db: {
          url: effectiveUrl
        }
      },
      log: logLevel as any,
    });

    return client.$extends(withAccelerate()) as PrismaClient;
  }
}

// Singleton instance management
interface PrismaGlobal {
  prisma?: PrismaClient;
  prismaPromise?: Promise<PrismaClient>;
}

const globalForPrisma = globalThis as unknown as PrismaGlobal;

// Get or create singleton instance
async function getPrismaSingleton(): Promise<PrismaClient> {
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

// Models that have direct orgId field and need tenant filtering
// Note: Asset and Room don't have orgId - they inherit through Site
const orgModels = ['WorkOrder', 'User', 'Site'];

// Type for query callback parameters
interface QueryParams {
  model: string;
  args: any;
  query: (args: any) => Promise<any>;
}

/**
 * Creates a Prisma client that automatically filters by orgId
 * This ensures tenant isolation - users can only see their org's data
 */
async function createPrismaClient(orgId?: string): Promise<PrismaClient> {
  const baseClient = await getPrismaSingleton();

  if (!orgId) {
    // No org context - return base client (for system operations)
    return baseClient;
  }

  return baseClient.$extends({
    query: {
      $allModels: {
        async findMany({ model, args, query }: QueryParams): Promise<any> {
          if (orgModels.includes(model)) {
            args.where = { ...args.where, orgId };
          }
          return query(args);
        },
        async findFirst({ model, args, query }: QueryParams): Promise<any> {
          if (orgModels.includes(model)) {
            args.where = { ...args.where, orgId };
          }
          return query(args);
        },
        async findUnique({ model, args, query }: QueryParams): Promise<any> {
          // findUnique can't add orgId to where, but we verify after
          const result = await query(args);
          if (result && orgModels.includes(model) && (result as any).orgId !== orgId) {
            return null; // Deny access to other orgs
          }
          return result;
        },
        async update({ model, args, query }: QueryParams): Promise<any> {
          if (orgModels.includes(model)) {
            args.where = { ...args.where, orgId } as any;
          }
          return query(args);
        },
        async delete({ model, args, query }: QueryParams): Promise<any> {
          if (orgModels.includes(model)) {
            args.where = { ...args.where, orgId } as any;
          }
          return query(args);
        },
        async create({ model, args, query }: QueryParams): Promise<any> {
          // Auto-inject orgId on create
          if (orgModels.includes(model)) {
            args.data = { ...args.data, orgId };
          }
          return query(args);
        }
      }
    }
  }) as PrismaClient;
}

/**
 * Creates a Prisma client for the current request with proper tenant isolation
 * In Cloudflare Workers, this will use the edge client with proper env/fetch context
 */
export async function createRequestPrisma(event: RequestEvent): Promise<PrismaClient> {
  const orgId = event.locals.user?.orgId;

  // For Cloudflare Workers, ensure environment variables are accessible
  if (isCloudflareWorker() && (event.platform as any)?.env) {
    // The environment variables should be accessible through getEnvVar()
    return createPrismaClient(orgId);
  }

  return createPrismaClient(orgId);
}

/**
 * Default prisma instance for system operations (non-tenant-specific)
 * This is used for operations like auth, session management, etc.
 */
export const prisma: Promise<PrismaClient> = getPrismaSingleton();

/**
 * Helper function to get a Prisma client for Node.js scripts
 * This ensures scripts always use the Node.js client even if imported from edge code
 */
export async function createNodePrismaClient(): Promise<PrismaClient> {
  // Force Node.js client for scripts
  const { PrismaClient: NodePrismaClient } = await import('@prisma/client');

  const databaseUrl = getEnvVar('DATABASE_URL') || getEnvVar('DIRECT_URL');
  const nodeEnv = getEnvVar('NODE_ENV') || 'development';
  const logLevel = ['query', 'info', 'warn', 'error']; // Enable all logs temporarily

  if (!databaseUrl) {
    throw new Error('DATABASE_URL or DIRECT_URL environment variable is required for Node.js client');
  }

  const adapter = new PrismaPg({
    url: databaseUrl
  });

  return new NodePrismaClient({
    adapter,
    log: logLevel as any,
  }) as PrismaClient;
}

/**
 * Runtime detection utility - can be used by other modules
 */
export { isCloudflareWorker };