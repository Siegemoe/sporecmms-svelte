// Prisma metrics and monitoring
import type { PrismaClient } from '@prisma/client';

export class PrismaMetrics {
  private static instance: PrismaMetrics;
  private queryTimes: Map<string, number[]> = new Map();
  private queryCounts: Map<string, number> = new Map();

  static getInstance(): PrismaMetrics {
    if (!PrismaMetrics.instance) {
      PrismaMetrics.instance = new PrismaMetrics();
    }
    return PrismaMetrics.instance;
  }

  setupMetrics(prisma: PrismaClient) {
    // Log slow queries (>100ms)
    prisma.$on('query', (e) => {
      const queryKey = `${e.model}.${e.action}`;
      const duration = e.duration;

      // Track metrics
      if (!this.queryTimes.has(queryKey)) {
        this.queryTimes.set(queryKey, []);
        this.queryCounts.set(queryKey, 0);
      }

      this.queryTimes.get(queryKey)!.push(duration);
      this.queryCounts.set(queryKey, this.queryCounts.get(queryKey)! + 1);

      // Log slow queries
      if (duration > 100) {
        console.warn(`[PRISMA] Slow Query (${duration}ms): ${queryKey}`, {
          query: e.query,
          params: e.params,
          target: e.target
        });
      }

      // Log frequent queries
      const count = this.queryCounts.get(queryKey)!;
      if (count % 10 === 0 && count > 0) {
        const avgTime = this.queryTimes.get(queryKey)!.reduce((a, b) => a + b, 0) / count;
        console.log(`[PRISMA] Query Stats - ${queryKey}: ${count} queries, avg ${avgTime.toFixed(2)}ms`);
      }
    });

    // Log errors
    prisma.$on('error', (e) => {
      console.error(`[PRISMA] Error: ${e.message}`, {
        target: e.target
      });
    });
  }

  getMetrics() {
    const metrics: any = {};
    for (const [query, times] of this.queryTimes.entries()) {
      const count = this.queryCounts.get(query) || 0;
      metrics[query] = {
        count,
        avgTime: times.reduce((a, b) => a + b, 0) / count,
        maxTime: Math.max(...times),
        minTime: Math.min(...times)
      };
    }
    return metrics;
  }
}