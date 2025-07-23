import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let redis: Redis | undefined

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

export const rateLimiters = {
  addTerrain: new Ratelimit({
    redis: redis!, 
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    analytics: true,
  }),
  
  rating: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
  }),
  
  general: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
  }),
  
  auth: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(5, '5 m'), 
    analytics: true,
  }),
  
  sensitive: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(20, '1 m'), 
    analytics: true,
  }),
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
  
  if (forwarded) {
    const firstIP = forwarded.split(',')[0].trim()
    if (ipRegex.test(firstIP)) return firstIP
  }
  
  if (realIP && ipRegex.test(realIP)) {
    return realIP
  }
  
  return `unknown-${Math.random().toString(36).substring(2, 15)}`
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