#!/bin/bash

# Script pour configurer automatiquement le cron job de maintenance Upstash

echo "🚀 Configuration du cron job pour la maintenance Upstash..."

# Obtenir le chemin absolu du projet
PROJECT_PATH=$(pwd)
echo "📁 Chemin du projet: $PROJECT_PATH"

# Créer le fichier de log
LOG_FILE="/var/log/upstash-maintenance.log"
echo "📝 Fichier de log: $LOG_FILE"

# Créer le fichier de log s'il n'existe pas
sudo touch "$LOG_FILE"
sudo chmod 666 "$LOG_FILE"

# Créer la commande cron
CRON_COMMAND="0 2 * * * cd $PROJECT_PATH && npm run maintenance:upstash >> $LOG_FILE 2>&1"

echo "⏰ Configuration du cron job..."
echo "   Commande: $CRON_COMMAND"

# Ajouter au crontab
(crontab -l 2>/dev/null; echo "$CRON_COMMAND") | crontab -

echo "✅ Cron job configuré avec succès!"
echo ""
echo "📋 Informations:"
echo "   - Maintenance programmée: Tous les jours à 2h du matin"
echo "   - Logs: $LOG_FILE"
echo "   - Projet: $PROJECT_PATH"
echo ""
echo "🔍 Pour vérifier le cron job:"
echo "   crontab -l"
echo ""
echo "📊 Pour voir les logs:"
echo "   tail -f $LOG_FILE"
echo ""
echo "🧪 Pour tester manuellement:"
echo "   npm run maintenance:test"
echo ""
echo "🎉 Configuration terminée!" 