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

// Create appropriate Prisma client based on runtime
async function createBasePrismaClient(): Promise<PrismaClient> {
  if (isCloudflareWorker()) {
    // Cloudflare Worker environment - use edge client
    const { PrismaClient: EdgePrismaClient } = await import('@prisma/client/edge');
    const { withAccelerate } = await import('@prisma/extension-accelerate');
    
    // For Cloudflare, we need to get the Accelerate connection string
    // This will be provided via environment variables in the worker
    const g = globalThis as any;
    const accelerateUrl = g.process?.env?.ACCELERATE_URL ||
                         g.process?.env?.DATABASE_URL ||
                         g.ACCELERATE_URL ||
                         g.DATABASE_URL;
    
    if (!accelerateUrl) {
      throw new Error('ACCELERATE_URL or DATABASE_URL environment variable is required for Cloudflare Workers');
    }

    return new EdgePrismaClient({
      datasources: {
        db: {
          url: accelerateUrl
        }
      },
      log: (globalThis as any).process?.env?.NODE_ENV === 'development' ?
            ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
    }).$extends(withAccelerate()) as PrismaClient;
  } else {
    // Node.js environment - use standard client
    const { PrismaClient: NodePrismaClient } = await import('@prisma/client');
    const { withAccelerate } = await import('@prisma/extension-accelerate');
    
    return new NodePrismaClient({
      log: (globalThis as any).process?.env?.NODE_ENV === 'development' ?
            ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
    }).$extends(withAccelerate()) as PrismaClient;
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
  
  // For Cloudflare Workers, we need to ensure the client has access to the worker's env and fetch
  if (isCloudflareWorker() && (event.platform as any)?.env) {
    // In Cloudflare, we might need to create a client with the platform context
    // This is handled by the edge client initialization above
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
  const { withAccelerate } = await import('@prisma/extension-accelerate');
  
  return new NodePrismaClient({
    log: (globalThis as any).process?.env?.NODE_ENV === 'development' ?
          ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
  }).$extends(withAccelerate()) as PrismaClient;
}

/**
 * Runtime detection utility - can be used by other modules
 */
export { isCloudflareWorker };
