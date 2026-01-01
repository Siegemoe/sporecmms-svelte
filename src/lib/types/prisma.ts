import type { PrismaClient } from '@prisma/client';

/**
 * Branded type for our Prisma client used in request handlers
 * Provides type safety instead of using `any` for prisma parameters
 */
export type RequestPrisma = PrismaClient;
