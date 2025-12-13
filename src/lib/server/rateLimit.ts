// Simple in-memory rate limiter for Cloudflare Workers
// Using a map with timestamps to track requests per IP

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { success: boolean; resetTime?: number; remaining?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    // First request or window has expired
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs
    };
    rateLimitMap.set(identifier, newEntry);
    return {
      success: true,
      resetTime: newEntry.resetTime,
      remaining: limit - 1
    };
  }

  if (entry.count >= limit) {
    return {
      success: false,
      resetTime: entry.resetTime,
      remaining: 0
    };
  }

  // Increment counter
  entry.count++;
  return {
    success: true,
    resetTime: entry.resetTime,
    remaining: limit - entry.count
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Cleanup every minute

// Rate limit configurations
export const RATE_LIMITS = {
  // Auth endpoints: 5 requests per minute
  AUTH: { limit: 5, windowMs: 60 * 1000 },
  // General API: 100 requests per minute
  API: { limit: 100, windowMs: 60 * 1000 },
  // Form submissions: 10 requests per minute
  FORM: { limit: 10, windowMs: 60 * 1000 }
};