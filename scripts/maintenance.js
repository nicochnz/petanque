#!/usr/bin/env node

// Script de maintenance pour Upstash Redis
// Ce script peut être exécuté manuellement ou via un cron job

require('dotenv').config({ path: '.env.local' })

const { Redis } = require('@upstash/redis')

async function performMaintenance() {
  console.log('🚀 Début de la maintenance Upstash...')
  
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('❌ Variables d\'environnement Upstash manquantes')
    process.exit(1)
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  try {
    const timestamp = new Date().toISOString()
    console.log(`📅 Timestamp: ${timestamp}`)
    
    // Effectuer des opérations de maintenance
    await redis.set('last_maintenance', timestamp, { ex: 86400 })
    await redis.set('app_status', 'active', { ex: 3600 })
    
    const maintenanceCount = await redis.incr('maintenance_count')
    await redis.expire('maintenance_count', 86400 * 7)
    
    await redis.hset('app_metadata', {
      name: 'petanque-app',
      last_maintenance: timestamp,
      maintenance_count: maintenanceCount,
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    })
    await redis.expire('app_metadata', 86400 * 30)
    
    // Vérifier que tout fonctionne
    const lastMaintenance = await redis.get('last_maintenance')
    const appStatus = await redis.get('app_status')
    const metadata = await redis.hgetall('app_metadata')
    
    console.log('✅ Maintenance effectuée avec succès!')
    console.log(`📊 Compteur de maintenance: ${maintenanceCount}`)
    console.log(`🔄 Dernière maintenance: ${lastMaintenance}`)
    console.log(`📈 Statut de l'app: ${appStatus}`)
    console.log(`📋 Métadonnées:`, metadata)
    
    // Afficher un résumé
    console.log('\n📋 Résumé de la maintenance:')
    console.log(`   - Timestamp: ${timestamp}`)
    console.log(`   - Compteur: ${maintenanceCount}`)
    console.log(`   - Statut: ${appStatus}`)
    console.log(`   - Base de données: Active`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la maintenance:', error)
    process.exit(1)
  }
}

// Exécuter la maintenance
performMaintenance()
  .then(() => {
    console.log('🎉 Maintenance terminée avec succès!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error)
    process.exit(1)
  }) 