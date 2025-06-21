import { NextResponse } from 'next/server'
import { maintainUpstashActivity, getUpstashStatus } from '@/lib/upstashMaintenance'

export const dynamic = 'force-dynamic'

export async function GET() {
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

export async function POST() {
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