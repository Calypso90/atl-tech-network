/**
 * Rate Limiting Utility
 *
 * Simple in-memory rate limiter for Edge runtime.
 * Note: Resets on cold start. For production at scale,
 * consider Cloudflare KV or Durable Objects.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store (per-isolate in Workers)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup threshold to prevent memory leak
const MAX_ENTRIES = 10000

/**
 * Check if request is within rate limit
 *
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param limit - Maximum requests allowed in window
 * @param windowMs - Time window in milliseconds (default: 1 hour)
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 3600000 // 1 hour
): boolean {
  const now = Date.now()
  const key = `rl_${identifier}`

  // Cleanup if store gets too large
  if (rateLimitStore.size > MAX_ENTRIES) {
    rateLimitStore.clear()
  }

  const entry = rateLimitStore.get(key)

  // New window or expired entry
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs
    })
    return true
  }

  // Within window, check count
  if (entry.count >= limit) {
    return false
  }

  // Increment and allow
  entry.count++
  return true
}

/**
 * Get remaining attempts for an identifier
 */
export function getRemainingAttempts(
  identifier: string,
  limit: number = 10
): number {
  const entry = rateLimitStore.get(`rl_${identifier}`)

  if (!entry || entry.resetAt < Date.now()) {
    return limit
  }

  return Math.max(0, limit - entry.count)
}

/**
 * Get reset time for an identifier
 */
export function getResetTime(identifier: string): number | null {
  const entry = rateLimitStore.get(`rl_${identifier}`)

  if (!entry || entry.resetAt < Date.now()) {
    return null
  }

  return entry.resetAt
}

/**
 * Create rate limit headers for response
 */
export function rateLimitHeaders(
  identifier: string,
  limit: number = 10
): Record<string, string> {
  const remaining = getRemainingAttempts(identifier, limit)
  const resetTime = getResetTime(identifier)

  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    ...(resetTime && { 'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString() })
  }
}
