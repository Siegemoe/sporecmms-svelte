import { getPrisma } from './prisma';
import type { RequestEvent } from '@sveltejs/kit';

export interface SecurityContext {
  event: RequestEvent;
  userId?: string;
  action?: string;
}

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
  blockDuration?: number; // in milliseconds
  violationThreshold?: number; // violations before persistent block
}

export class SecurityManager {
  private static instance: SecurityManager;

  // In-memory cache for blocked IPs (faster than DB queries)
  private ipBlockCache = new Map<string, { blocked: boolean; expiresAt?: number; reason: string }>();
  private lastCacheCleanup = 0;
  private readonly CACHE_CLEANUP_INTERVAL = 60000; // 1 minute

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  // Clean expired entries from cache
  private cleanupCache() {
    const now = Date.now();
    if (now - this.lastCacheCleanup < this.CACHE_CLEANUP_INTERVAL) return;

    for (const [ip, block] of this.ipBlockCache.entries()) {
      if (block.expiresAt && now > block.expiresAt) {
        this.ipBlockCache.delete(ip);
      }
    }
    this.lastCacheCleanup = now;
  }

  // Check if IP is blocked
  async isIPBlocked(ip: string): Promise<{ blocked: boolean; reason?: string; expiresAt?: Date }> {
    // Check cache first
    this.cleanupCache();
    const cached = this.ipBlockCache.get(ip);
    if (cached) {
      if (!cached.expiresAt || Date.now() < cached.expiresAt) {
        return { blocked: true, reason: cached.reason };
      }
      this.ipBlockCache.delete(ip);
    }

    // Check database
    const prisma = await getPrisma();
    const block = await prisma.iPBlock.findFirst({
      where: {
        ipAddress: ip,
        OR: [
          { expiresAt: null }, // Permanent block
          { expiresAt: { gte: new Date() } } // Temporary block not expired
        ]
      }
    });

    if (block) {
      // Cache the result
      const expiresAt = block.expiresAt ? block.expiresAt.getTime() : undefined;
      this.ipBlockCache.set(ip, {
        blocked: true,
        expiresAt,
        reason: block.reason
      });

      return {
        blocked: true,
        reason: block.reason,
        expiresAt: block.expiresAt || undefined
      };
    }

    return { blocked: false };
  }

  // Block an IP address
  async blockIP(
    ip: string,
    reason: string,
    severity: 'TEMPORARY' | 'PERSISTENT' = 'TEMPORARY',
    blockedBy?: string,
    organizationId?: string
  ): Promise<void> {
    const prisma = await getPrisma();
    const now = new Date();
    let expiresAt: Date | undefined;

    if (severity === 'TEMPORARY') {
      expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
    }

    // For manual blocks (blockedBy provided), organizationId is required
    // For automatic system blocks (rate limit), organizationId is null (global block)
    const isSystemBlock = !blockedBy;
    if (!isSystemBlock && !organizationId) {
      throw new Error('organizationId is required for manual IP blocks');
    }

    // Build update data
    const updateData: any = {
      reason,
      severity,
      blockedAt: now,
      expiresAt,
      violationCount: { increment: 1 }
    };
    if (organizationId) updateData.organizationId = organizationId;
    if (blockedBy !== undefined) updateData.blockedBy = blockedBy;

    // Build create data
    const createData: any = {
      ipAddress: ip,
      reason,
      severity,
      blockedAt: now,
      expiresAt,
      violationCount: 1
    };
    if (organizationId) createData.organizationId = organizationId;
    if (blockedBy !== undefined) createData.blockedBy = blockedBy;

    await prisma.iPBlock.upsert({
      where: { ipAddress: ip },
      update: updateData,
      create: createData
    });

    // Update cache
    this.ipBlockCache.set(ip, {
      blocked: true,
      expiresAt: expiresAt?.getTime(),
      reason
    });

    // Log the block action
    await this.logSecurityEvent({
      ipAddress: ip,
      action: 'IP_BLOCKED',
      details: { reason, severity, blockedBy, organizationId },
      severity: severity === 'PERSISTENT' ? 'CRITICAL' : 'WARNING'
    });
  }

  // Enhanced rate limiting with IP blocking
  async checkRateLimit(
    ctx: SecurityContext,
    config: RateLimitConfig
  ): Promise<{ success: boolean; blocked?: boolean; remaining?: number; resetTime?: number }> {
    const ip = this.getClientIP(ctx.event);
    const key = `${ip}:${ctx.action || 'global'}`;

    // First check if IP is blocked
    const blockStatus = await this.isIPBlocked(ip);
    if (blockStatus.blocked) {
      return { success: false, blocked: true };
    }

    // Use existing in-memory rate limiter for basic checks
    const rateLimitResult = this.checkInMemoryRateLimit(key, config);

    if (!rateLimitResult.success) {
      // Log rate limit violation
      await this.logSecurityEvent({
        event: ctx.event,
        ipAddress: ip,
        action: 'RATE_LIMIT_VIOLATION',
        details: {
          limit: config.limit,
          windowMs: config.windowMs,
          action: ctx.action
        },
        severity: 'WARNING',
        userId: ctx.userId
      });

      // Check if we should block the IP
      if (config.violationThreshold) {
        // Count recent violations
        const recentViolations = await this.getRecentViolations(ip, config.windowMs * 2);

        if (recentViolations >= config.violationThreshold) {
          // Block the IP
          const blockDuration = config.blockDuration || 24 * 60 * 60 * 1000; // 24 hours default
          await this.blockIP(
            ip,
            `Excessive violations: ${recentViolations} in ${config.windowMs * 2}ms`,
            'PERSISTENT',
            undefined
          );
          return { success: false, blocked: true };
        } else {
          // Temporary block
          await this.blockIP(
            ip,
            'Rate limit exceeded',
            'TEMPORARY',
            undefined
          );
        }
      }
    }

    return rateLimitResult;
  }

  // Simple in-memory rate limiter (keeping existing logic)
  public rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  public checkInMemoryRateLimit(key: string, config: RateLimitConfig) {
    const now = Date.now();
    const entry = this.rateLimitMap.get(key);

    if (!entry || now > entry.resetTime) {
      const newEntry = {
        count: 1,
        resetTime: now + config.windowMs
      };
      this.rateLimitMap.set(key, newEntry);
      return {
        success: true,
        resetTime: newEntry.resetTime,
        remaining: config.limit - 1
      };
    }

    if (entry.count >= config.limit) {
      return {
        success: false,
        resetTime: entry.resetTime,
        remaining: 0
      };
    }

    entry.count++;
    return {
      success: true,
      resetTime: entry.resetTime,
      remaining: config.limit - entry.count
    };
  }

  // Get client IP from request
  private getClientIP(event: RequestEvent): string {
    // Check various headers for real IP
    const cfConnectingIP = event.request.headers.get('cf-connecting-ip');
    if (cfConnectingIP) return cfConnectingIP;

    const xForwardedFor = event.request.headers.get('x-forwarded-for');
    if (xForwardedFor) {
      return xForwardedFor.split(',')[0].trim();
    }

    const xRealIP = event.request.headers.get('x-real-ip');
    if (xRealIP) return xRealIP;

    // Fallback to event clientAddress
    return event.getClientAddress();
  }

  // Get recent violations count
  private async getRecentViolations(ip: string, timeWindowMs: number): Promise<number> {
    const prisma = await getPrisma();
    const cutoff = new Date(Date.now() - timeWindowMs);

    const count = await prisma.securityLog.count({
      where: {
        ipAddress: ip,
        action: 'RATE_LIMIT_VIOLATION',
        createdAt: { gte: cutoff }
      }
    });

    return count;
  }

  // Log security events
  async logSecurityEvent(data: {
    event?: RequestEvent;
    ipAddress?: string;
    action: string;
    details?: any;
    severity?: 'INFO' | 'WARNING' | 'CRITICAL';
    userId?: string;
  }): Promise<void> {
    const prisma = await getPrisma();

    let ip = data.ipAddress;
    let userAgent: string | undefined;

    if (data.event && !ip) {
      ip = this.getClientIP(data.event);
      userAgent = data.event.request.headers.get('user-agent') || undefined;
    }

    await prisma.securityLog.create({
      data: {
        ipAddress: ip || 'unknown',
        userAgent,
        action: data.action,
        details: data.details,
        severity: data.severity || 'INFO',
        userId: data.userId
      }
    });

    // Clean up old logs (keep only 30 days)
    this.cleanupOldLogs();
  }

  // Clean up old logs (run periodically)
  private async cleanupOldLogs() {
    // Only run cleanup once per hour
    const lastCleanup = parseInt(process.env.LAST_LOG_CLEANUP || '0');
    const now = Date.now();
    if (now - lastCleanup < 3600000) return; // 1 hour

    process.env.LAST_LOG_CLEANUP = now.toString();

    const prisma = await getPrisma();
    const cutoff = new Date(now - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    await prisma.securityLog.deleteMany({
      where: {
        createdAt: { lt: cutoff }
      }
    });

    // Clean up expired IP blocks
    await prisma.iPBlock.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    });
  }

  // Get security logs for dashboard
  async getSecurityLogs(filters: {
    severity?: string;
    action?: string;
    ipAddress?: string;
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
    organizationId?: string;
  }) {
    const prisma = await getPrisma();
    const {
      severity,
      action,
      ipAddress,
      limit = 50,
      offset = 0,
      startDate,
      endDate,
      organizationId
    } = filters;

    const where: any = {};
    if (severity) where.severity = severity;
    if (action) where.action = action;
    if (ipAddress) where.ipAddress = ipAddress;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }
    // Filter by organization through User relation
    if (organizationId) {
      where.User = { organizationId };
    }

    const [logs, total] = await Promise.all([
      prisma.securityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          User: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.securityLog.count({ where })
    ]);

    return { logs, total };
  }

  // Get blocked IPs for dashboard
  async getBlockedIPs(limit = 50, offset = 0, organizationId?: string) {
    const prisma = await getPrisma();

    // Show org-specific blocks AND global system blocks (organizationId is null)
    // This allows admins to see both manual blocks they created AND auto-blocks from rate limiting
    const where = organizationId
      ? { OR: [{ organizationId }, { organizationId: null }] }
      : undefined;

    const [blocks, total] = await Promise.all([
      prisma.iPBlock.findMany({
        where,
        orderBy: { blockedAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          Organization: {
            select: { id: true, name: true }
          },
          User: {
            select: { id: true, firstName: true, lastName: true }
          }
        }
      }),
      prisma.iPBlock.count({ where })
    ]);

    return { blocks, total };
  }

  // Unblock an IP
  async unblockIP(ip: string, unblockedBy: string): Promise<void> {
    const prisma = await getPrisma();

    await prisma.iPBlock.delete({
      where: { ipAddress: ip }
    });

    // Remove from cache
    this.ipBlockCache.delete(ip);

    // Log the unblock action
    await this.logSecurityEvent({
      ipAddress: ip,
      action: 'IP_UNBLOCKED',
      details: { unblockedBy },
      severity: 'INFO'
    });
  }
}

// Rate limit configurations
export const SECURITY_RATE_LIMITS = {
  AUTH: {
    limit: 5,
    windowMs: 60 * 1000,
    blockDuration: 15 * 60 * 1000, // 15 minutes
    violationThreshold: 3 // Block after 3 violations
  },
  API: {
    limit: 100,
    windowMs: 60 * 1000,
    violationThreshold: 5
  },
  FORM: {
    limit: 10,
    windowMs: 60 * 1000,
    violationThreshold: 3
  },
  PASSWORD_RESET: {
    limit: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    violationThreshold: 2
  }
};