import { NextRequest, NextResponse } from 'next/server'
import { maintainUpstashActivity, getUpstashStatus } from '@/lib/upstashMaintenance'

export const dynamic = 'force-dynamic'

const MAINTENANCE_SECRET = process.env.NEXTAUTH_SECRET

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !MAINTENANCE_SECRET) return false
  return authHeader === `Bearer ${MAINTENANCE_SECRET}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const status = await getUpstashStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error('Erreur lors de la vérification du statut:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du statut' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const result = await maintainUpstashActivity()
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 500 })
    }
  } catch (error) {
    console.error('Erreur lors de la maintenance:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la maintenance' },
      { status: 500 }
    )
  }
} 