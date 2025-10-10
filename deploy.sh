#!/bin/bash

# 🚀 Script de déploiement automatique
# Exécuté par le webhook GitHub ou manuellement

set -e

# Configuration
PROJECT_DIR="/opt/autoaziz"
BACKUP_DIR="/opt/backups/autoaziz"
LOG_FILE="/var/log/autoaziz-deploy.log"
SLACK_WEBHOOK_URL="$SLACK_WEBHOOK_URL"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fonction de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}" | tee -a $LOG_FILE
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}" | tee -a $LOG_FILE
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️ $1${NC}" | tee -a $LOG_FILE
}

# Fonction de notification Slack
notify_slack() {
    local message="$1"
    local color="$2"
    
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"attachments\":[{\"color\":\"$color\",\"text\":\"🚗 Auto Aziz: $message\"}]}" \
            "$SLACK_WEBHOOK_URL" || true
    fi
}

# Fonction de backup
backup_database() {
    log "Création du backup de la base de données..."
    
    mkdir -p $BACKUP_DIR
    
    docker exec autoaziz-postgres-prod pg_dump -U postgres autoaziz > \
        "$BACKUP_DIR/autoaziz_$(date +%Y%m%d_%H%M%S).sql"
    
    # Garder seulement les 7 derniers backups
    find $BACKUP_DIR -name "autoaziz_*.sql" -type f -mtime +7 -delete
    
    log_success "Backup créé avec succès"
}

# Fonction de rollback
rollback() {
    log_error "Rollback en cours..."
    
    cd $PROJECT_DIR
    git reset --hard HEAD~1
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d
    
    notify_slack "Rollback effectué après échec du déploiement" "danger"
}

# Fonction de test de santé
health_check() {
    log "Vérification de la santé de l'application..."
    
    # Attendre que les services démarrent
    sleep 30
    
    # Tester le backend
    if ! curl -f http://localhost:3001/health >/dev/null 2>&1; then
        log_error "Backend health check failed"
        return 1
    fi
    
    # Tester le frontend
    if ! curl -f http://localhost/health >/dev/null 2>&1; then
        log_error "Frontend health check failed"
        return 1
    fi
    
    log_success "Health checks passed"
    return 0
}

# Script principal de déploiement
main() {
    log "🚀 Début du déploiement Auto Aziz"
    
    # Vérifier que nous sommes dans le bon répertoire
    if [[ ! -d "$PROJECT_DIR" ]]; then
        log_error "Répertoire projet non trouvé: $PROJECT_DIR"
        exit 1
    fi
    
    cd $PROJECT_DIR
    
    # Backup de la base de données
    backup_database
    
    # Récupérer les dernières modifications
    log "Récupération des dernières modifications..."
    git fetch origin
    
    # Vérifier s'il y a des mises à jour
    if git diff --quiet HEAD origin/main; then
        log "Aucune mise à jour disponible"
        exit 0
    fi
    
    # Mettre à jour le code
    log "Mise à jour du code..."
    git reset --hard origin/main
    
    # Arrêter les services
    log "Arrêt des services..."
    docker-compose -f docker-compose.prod.yml down
    
    # Rebuild et redémarrer
    log "Reconstruction et redémarrage des services..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.prod.yml up -d
    
    # Attendre et vérifier la santé
    if health_check; then
        log_success "🎉 Déploiement réussi !"
        notify_slack "Déploiement réussi ! Version $(git rev-parse --short HEAD)" "good"
        
        # Nettoyer les images Docker inutilisées
        docker system prune -f
        
    else
        log_error "Échec du health check, rollback..."
        rollback
        exit 1
    fi
}

# Gestion des erreurs
trap 'log_error "Erreur during deployment"; rollback; exit 1' ERR

# Exécuter le script principal
main "$@"