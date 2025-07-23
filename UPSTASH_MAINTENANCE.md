# Maintenance Upstash Redis 🚀

Ce document explique comment maintenir l'activité de votre base de données Upstash Redis pour éviter qu'elle soit supprimée pour inactivité.

## 🎯 Objectif

Upstash peut supprimer les bases de données inactives. Ce système de maintenance effectue des opérations régulières pour maintenir l'activité de votre base de données.

## 📋 Méthodes de maintenance

### 1. API Route (Recommandé)

Vous pouvez déclencher la maintenance via l'API :

```bash
# Vérifier le statut
curl -X GET https://votre-domaine.com/api/maintenance/upstash

# Effectuer la maintenance
curl -X POST https://votre-domaine.com/api/maintenance/upstash
```

### 2. Script local

Exécuter le script de maintenance localement :

```bash
npm run maintenance:upstash
```

### 3. Cron Job (Automatique)

Pour automatiser la maintenance, ajoutez un cron job :

```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne pour exécuter la maintenance tous les jours à 2h du matin
0 2 * * * cd /chemin/vers/votre/projet && npm run maintenance:upstash >> /var/log/upstash-maintenance.log 2>&1
```

### 4. Service externe (Recommandé pour la production)

Utilisez un service comme :
- **Vercel Cron Jobs** (si déployé sur Vercel)
- **GitHub Actions** (gratuit)
- **Cron-job.org** (gratuit)
- **UptimeRobot** (gratuit)

#### Exemple avec GitHub Actions

Créez `.github/workflows/upstash-maintenance.yml` :

```yaml
name: Upstash Maintenance

on:
  schedule:
    # Tous les jours à 2h du matin UTC
    - cron: '0 2 * * *'
  workflow_dispatch: # Permet de déclencher manuellement

jobs:
  maintenance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run maintenance
        run: npm run maintenance:upstash
        env:
          UPSTASH_REDIS_REST_URL: ${{ secrets.UPSTASH_REDIS_REST_URL }}
          UPSTASH_REDIS_REST_TOKEN: ${{ secrets.UPSTASH_REDIS_REST_TOKEN }}
```

## 🔧 Configuration

Assurez-vous que vos variables d'environnement sont configurées :

```env
UPSTASH_REDIS_REST_URL=votre_url_upstash
UPSTASH_REDIS_REST_TOKEN=votre_token_upstash
```

## 📊 Opérations effectuées

La maintenance effectue les opérations suivantes :

1. **Mise à jour du timestamp** de dernière maintenance
2. **Mise à jour du statut** de l'application
3. **Incrémentation du compteur** de maintenance
4. **Stockage des métadonnées** de l'application
5. **Vérification** que toutes les opérations fonctionnent

## 🕐 Fréquence recommandée

- **Minimum** : Une fois par semaine
- **Recommandé** : Une fois par jour
- **Optimal** : Toutes les 12 heures

## 🔍 Vérification

Pour vérifier que la maintenance fonctionne :

1. Consultez les logs de votre script
2. Vérifiez le statut via l'API
3. Surveillez votre dashboard Upstash

## 🚨 Dépannage

### Erreur de connexion
- Vérifiez vos variables d'environnement
- Assurez-vous que votre base de données Upstash est active

### Erreur d'autorisation
- Vérifiez que votre token Upstash est valide
- Régénérez le token si nécessaire

### Script ne s'exécute pas
- Vérifiez les permissions du fichier
- Assurez-vous que Node.js est installé
- Vérifiez que toutes les dépendances sont installées

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs d'erreur
2. Consultez la documentation Upstash
3. Contactez le support Upstash si nécessaire

---

**Note** : Cette maintenance est essentielle pour maintenir votre base de données active. Configurez au moins une méthode automatique pour éviter la perte de données. 