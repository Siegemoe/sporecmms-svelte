// Backward compatibility - re-export from security module
import { SecurityManager, SECURITY_RATE_LIMITS as NEW_RATE_LIMITS } from './security';

const securityManager = SecurityManager.getInstance();

export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { success: boolean; resetTime?: number; remaining?: number } {
  // Use the in-memory rate limiter from security manager
  return securityManager.checkInMemoryRateLimit(identifier, { limit, windowMs });
}

// Rate limit configurations (using new security configurations)
export const RATE_LIMITS = {
  // Auth endpoints: 5 requests per minute
  AUTH: { limit: NEW_RATE_LIMITS.AUTH.limit, windowMs: NEW_RATE_LIMITS.AUTH.windowMs },
  // General API: 100 requests per minute
  API: { limit: NEW_RATE_LIMITS.API.limit, windowMs: NEW_RATE_LIMITS.API.windowMs },
  // Form submissions: 10 requests per minute
  FORM: { limit: NEW_RATE_LIMITS.FORM.limit, windowMs: NEW_RATE_LIMITS.FORM.windowMs }
};

// Export the new security manager for direct access
export { SecurityManager };