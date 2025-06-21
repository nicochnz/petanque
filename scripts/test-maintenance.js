#!/usr/bin/env node

// Script de test pour la maintenance Upstash
// Ce script teste la connexion et effectue une maintenance

require('dotenv').config({ path: '.env.local' })

const { Redis } = require('@upstash/redis')

async function testMaintenance() {
  console.log('🧪 Test de la maintenance Upstash...')
  
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('❌ Variables d\'environnement Upstash manquantes')
    console.log('📝 Assurez-vous que votre fichier .env.local contient:')
    console.log('   UPSTASH_REDIS_REST_URL=votre_url')
    console.log('   UPSTASH_REDIS_REST_TOKEN=votre_token')
    process.exit(1)
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  try {
    console.log('🔗 Test de connexion...')
    
    // Test simple de connexion
    await redis.set('test_connection', 'success', { ex: 60 })
    const testResult = await redis.get('test_connection')
    
    if (testResult === 'success') {
      console.log('✅ Connexion réussie!')
    } else {
      throw new Error('Test de connexion échoué')
    }
    
    // Effectuer une maintenance complète
    console.log('🔧 Effectuer la maintenance...')
    
    const timestamp = new Date().toISOString()
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
    
    // Vérifier les résultats
    const lastMaintenance = await redis.get('last_maintenance')
    const appStatus = await redis.get('app_status')
    const metadata = await redis.hgetall('app_metadata')
    
    console.log('🎉 Test de maintenance réussi!')
    console.log('📊 Résultats:')
    console.log(`   - Dernière maintenance: ${lastMaintenance}`)
    console.log(`   - Statut de l'app: ${appStatus}`)
    console.log(`   - Compteur: ${maintenanceCount}`)
    console.log(`   - Métadonnées: ${JSON.stringify(metadata, null, 2)}`)
    
    console.log('\n🚀 Votre base de données Upstash est maintenant active!')
    console.log('💡 Pour maintenir l\'activité, configurez une maintenance automatique.')
    console.log('📖 Consultez UPSTASH_MAINTENANCE.md pour plus d\'informations.')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
    console.log('\n🔧 Solutions possibles:')
    console.log('   1. Vérifiez vos variables d\'environnement')
    console.log('   2. Assurez-vous que votre base de données Upstash est active')
    console.log('   3. Vérifiez votre token d\'accès')
    process.exit(1)
  }
}

// Exécuter le test
testMaintenance()
  .then(() => {
    console.log('\n✅ Test terminé avec succès!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Erreur fatale:', error)
    process.exit(1)
  }) 