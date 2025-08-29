// Version simplifiée du rate limiting sans Upstash
// Pour réactiver Upstash plus tard, remplacez ce fichier par la version originale

export const rateLimiters = {
  addTerrain: {
    limit: async () => ({ success: true, limit: 3, remaining: 2, reset: Date.now() + 3600000 })
  },
  
  rating: {
    limit: async () => ({ success: true, limit: 10, remaining: 9, reset: Date.now() + 60000 })
  },
  
  general: {
    limit: async () => ({ success: true, limit: 100, remaining: 99, reset: Date.now() + 60000 })
  },
  
  auth: {
    limit: async () => ({ success: true, limit: 5, remaining: 4, reset: Date.now() + 300000 })
  },
  
  sensitive: {
    limit: async () => ({ success: true, limit: 20, remaining: 19, reset: Date.now() + 60000 })
  },
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