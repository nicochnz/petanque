import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimiters, getRateLimitIdentifier } from './lib/rateLimit'

export async function middleware(request: NextRequest) {
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

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
} 