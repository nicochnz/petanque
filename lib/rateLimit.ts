import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Configuration Redis
let redis: Redis | undefined

// Initialiser Redis seulement si les variables d'environnement sont présentes
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

// Rate limiters pour différentes actions
export const rateLimiters = {
  // Ajout de terrain : 3 par heure par utilisateur
  addTerrain: new Ratelimit({
    redis: redis!, // On force le type car on sait que redis est défini
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    analytics: true,
  }),
  
  // Notation : 10 par minute par utilisateur
  rating: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
  }),
  
  // Requêtes générales : 100 par minute par IP
  general: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
  }),
  
  // Protection contre le brute force
  auth: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(5, '5 m'), // 5 tentatives par 5 minutes
    analytics: true,
  }),
  
  // Protection contre les attaques DoS
  sensitive: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 requêtes par minute
    analytics: true,
  }),
}

// Helper pour extraire l'IP de la requête
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  // Validation plus stricte des IPs
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
  
  if (forwarded) {
    const firstIP = forwarded.split(',')[0].trim()
    if (ipRegex.test(firstIP)) return firstIP
  }
  
  if (realIP && ipRegex.test(realIP)) {
    return realIP
  }
  
  // Si pas d'IP valide, utiliser un identifiant unique
  return `unknown-${Math.random().toString(36).substring(2, 15)}`
}

// Helper pour créer un identifiant unique (IP + User ID si connecté)
export function getRateLimitIdentifier(request: Request, userId?: string): string {
  const ip = getClientIP(request)
  return userId ? `user:${userId}` : `ip:${ip}`
}

// Ajouter cette fonction helper
export function addRateLimitHeaders(response: Response, limit: number, remaining: number, reset: number) {
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', reset.toString())
  return response
} 