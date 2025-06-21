import { Redis } from '@upstash/redis'

let redis: Redis | undefined

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

export async function maintainUpstashActivity() {
  if (!redis) {
    console.log('Upstash Redis non configuré')
    return { success: false, message: 'Upstash Redis non configuré' }
  }

  try {
    const timestamp = new Date().toISOString()
    
    // Effectuer quelques opérations simples pour maintenir l'activité
    await redis.set('last_maintenance', timestamp, { ex: 86400 }) // Expire dans 24h
    await redis.set('app_status', 'active', { ex: 3600 }) // Expire dans 1h
    
    // Incrémenter un compteur de maintenance
    const maintenanceCount = await redis.incr('maintenance_count')
    await redis.expire('maintenance_count', 86400 * 7) // Expire dans 7 jours
    
    // Stocker quelques métadonnées sur l'application
    await redis.hset('app_metadata', {
      name: 'petanque-app',
      last_maintenance: timestamp,
      maintenance_count: maintenanceCount,
      version: '1.0.0'
    })
    await redis.expire('app_metadata', 86400 * 30) // Expire dans 30 jours
    
    // Effectuer une opération de lecture pour s'assurer que tout fonctionne
    const lastMaintenance = await redis.get('last_maintenance')
    const appStatus = await redis.get('app_status')
    
    console.log(`Maintenance Upstash effectuée: ${timestamp}`)
    console.log(`Compteur de maintenance: ${maintenanceCount}`)
    
    return {
      success: true,
      message: 'Maintenance Upstash effectuée avec succès',
      timestamp,
      maintenanceCount,
      lastMaintenance,
      appStatus
    }
    
  } catch (error) {
    console.error('Erreur lors de la maintenance Upstash:', error)
    return {
      success: false,
      message: 'Erreur lors de la maintenance',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

export async function getUpstashStatus() {
  if (!redis) {
    return { connected: false, message: 'Upstash Redis non configuré' }
  }

  try {
    const lastMaintenance = await redis.get('last_maintenance')
    const appStatus = await redis.get('app_status')
    const maintenanceCount = await redis.get('maintenance_count')
    const metadata = await redis.hgetall('app_metadata')
    
    return {
      connected: true,
      lastMaintenance,
      appStatus,
      maintenanceCount,
      metadata
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du statut Upstash:', error)
    return {
      connected: false,
      message: 'Erreur de connexion à Upstash',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
} 