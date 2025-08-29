// Version simplifiée de la maintenance sans Upstash
// Pour réactiver Upstash plus tard, remplacez ce fichier par la version originale

export async function maintainUpstashActivity() {
  console.log('Maintenance Upstash désactivée - mode développement')
  
  return {
    success: true,
    message: 'Maintenance Upstash désactivée - mode développement',
    timestamp: new Date().toISOString(),
    maintenanceCount: 0,
    lastMaintenance: null,
    appStatus: 'development'
  }
}

export async function getUpstashStatus() {
  return {
    connected: false,
    message: 'Upstash désactivé - mode développement',
    lastMaintenance: null,
    appStatus: 'development',
    maintenanceCount: 0,
    metadata: {
      name: 'petanque-app',
      status: 'development-mode',
      message: 'Upstash temporairement désactivé'
    }
  }
} 