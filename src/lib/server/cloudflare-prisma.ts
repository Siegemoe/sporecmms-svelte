import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Cloudflare-compatible Prisma client
export function createCloudflarePrisma() {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('[PRISMA] DATABASE_URL is not set in Cloudflare environment');
      throw new Error('Database connection string not configured');
    }

    console.log('[PRISMA] Initializing with DATABASE_URL:', process.env.DATABASE_URL.substring(0, 20) + '...');

    const client = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    }).$extends(withAccelerate());

    return client;
  } catch (error) {
    console.error('[PRISMA] Failed to initialize Prisma client:', error);
    throw error;
  }
}