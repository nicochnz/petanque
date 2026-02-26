import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let redis: Redis | null = null
let rateLimitEnabled = false

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    rateLimitEnabled = true
  }
} catch {
  rateLimitEnabled = false
}

const PASS_THROUGH = { success: true, limit: 0, remaining: 0, reset: 0, pending: Promise.resolve() }

function createLimiter(window: Parameters<typeof Ratelimit.slidingWindow>[0], interval: Parameters<typeof Ratelimit.slidingWindow>[1], prefix: string) {
  if (!rateLimitEnabled || !redis) {
    return { limit: async () => PASS_THROUGH }
  }
  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(window, interval),
    prefix,
  })
  return {
    limit: async (identifier: string) => {
      try {
        return await rl.limit(identifier)
      } catch {
        return PASS_THROUGH
      }
    }
  }
}

export const rateLimiters = {
  addTerrain: createLimiter(3, '1 h', 'rl:addTerrain'),
  rating: createLimiter(10, '1 m', 'rl:rating'),
  general: createLimiter(100, '1 m', 'rl:general'),
  auth: createLimiter(5, '5 m', 'rl:auth'),
  sensitive: createLimiter(20, '1 m', 'rl:sensitive'),
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/

  if (forwarded) {
    const firstIP = forwarded.split(',')[0].trim()
    if (ipRegex.test(firstIP)) return firstIP
  }
  if (realIP && ipRegex.test(realIP)) return realIP
  return 'unknown-ip'
}

export function getRateLimitIdentifier(request: Request, userId?: string): string {
  const ip = getClientIP(request)
  return userId ? `user:${userId}` : `ip:${ip}`
}

export function addRateLimitHeaders(response: Response, limit: number, remaining: number, reset: number) {
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', reset.toString())
  return response
}
