import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimiters, getRateLimitIdentifier } from './lib/rateLimit'

export async function middleware(request: NextRequest) {
  // Rate limiting global pour toutes les routes API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const identifier = getRateLimitIdentifier(request)
    const { success } = await rateLimiters.general.limit(identifier)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez patienter.' },
        { status: 429 }
      )
    }
  }

  // Pour l'instant, on laisse passer toutes les requêtes
  // Le contrôle d'accès se fera côté client
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
} 