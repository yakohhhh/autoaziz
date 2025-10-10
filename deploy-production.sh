#!/bin/bash

# 🚗 Auto Aziz - Script de mise en production
# Description: Déploiement automatisé en production avec toutes les vérifications

set -e

# ===============================================
# 🎨 Configuration des couleurs et variables
# ===============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

DOMAIN=""
EMAIL=""
BACKUP_DIR="/opt/autoaziz-backups"
LOG_FILE="/var/log/autoaziz-deploy.log"

# ===============================================
# 📝 Fonctions utilitaires
# ===============================================
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

print_header() {
    log "${BLUE}=====================================${NC}"
    log "${BLUE}$1${NC}"
    log "${BLUE}=====================================${NC}"
}

print_success() {
    log "${GREEN}✅ $1${NC}"
}

print_error() {
    log "${RED}❌ $1${NC}"
}

print_warning() {
    log "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    log "${CYAN}ℹ️  $1${NC}"
}

# ===============================================
# 🔧 Vérifications pré-déploiement
# ===============================================
pre_deployment_checks() {
    print_header "🔍 VÉRIFICATIONS PRÉ-DÉPLOIEMENT"
    
    # Vérification des variables d'environnement
    if [ -z "$DOMAIN" ]; then
        print_error "Variable DOMAIN non définie"
        read -p "🌐 Entrez votre domaine (ex: autoaziz.com): " DOMAIN
    fi
    
    if [ -z "$EMAIL" ]; then
        read -p "📧 Entrez votre email pour Let's Encrypt: " EMAIL
    fi
    
    # Vérification des prérequis
    print_info "Vérification de Docker..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker n'est pas installé"
        exit 1
    fi
    print_success "Docker détecté"
    
    print_info "Vérification de Docker Compose..."
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose n'est pas installé"
        exit 1
    fi
    print_success "Docker Compose détecté"
    
    # Vérification des fichiers de configuration
    print_info "Vérification des fichiers de configuration..."
    required_files=(
        ".env.prod"
        "docker-compose.prod.yml"
        "nginx/nginx.conf"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Fichier manquant: $file"
            exit 1
        fi
    done
    print_success "Tous les fichiers de configuration sont présents"
    
    # Test de compilation
    print_info "Test de compilation du backend..."
    cd backend
    npm run build || {
        print_error "Échec de la compilation du backend"
        exit 1
    }
    cd ..
    
    print_info "Test de compilation du frontend..."
    cd frontend
    npm run build || {
        print_error "Échec de la compilation du frontend"
        exit 1
    }
    cd ..
    
    print_success "Compilation réussie"
}

# ===============================================
# 💾 Sauvegarde
# ===============================================
create_backup() {
    print_header "💾 CRÉATION DE SAUVEGARDE"
    
    # Création du répertoire de sauvegarde
    mkdir -p "$BACKUP_DIR"
    
    BACKUP_TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_PATH="$BACKUP_DIR/backup_$BACKUP_TIMESTAMP"
    
    print_info "Création de la sauvegarde dans $BACKUP_PATH"
    
    # Sauvegarde de la base de données
    if docker ps | grep -q postgres; then
        print_info "Sauvegarde de la base de données..."
        docker exec autoaziz-postgres-1 pg_dump -U autoaziz autoaziz > "$BACKUP_PATH/database.sql"
        print_success "Base de données sauvegardée"
    fi
    
    # Sauvegarde des fichiers de configuration
    print_info "Sauvegarde des fichiers de configuration..."
    mkdir -p "$BACKUP_PATH/config"
    cp -r .env* "$BACKUP_PATH/config/" 2>/dev/null || true
    cp -r nginx/ "$BACKUP_PATH/config/" 2>/dev/null || true
    cp docker-compose*.yml "$BACKUP_PATH/config/" 2>/dev/null || true
    
    # Compression de la sauvegarde
    cd "$BACKUP_DIR"
    tar -czf "backup_$BACKUP_TIMESTAMP.tar.gz" "backup_$BACKUP_TIMESTAMP/"
    rm -rf "backup_$BACKUP_TIMESTAMP/"
    cd - > /dev/null
    
    print_success "Sauvegarde créée: backup_$BACKUP_TIMESTAMP.tar.gz"
}

# ===============================================
# 🏗️ Build et déploiement
# ===============================================
build_and_deploy() {
    print_header "🏗️ BUILD ET DÉPLOIEMENT"
    
    # Arrêt des services existants
    print_info "Arrêt des services existants..."
    docker-compose -f docker-compose.prod.yml down || true
    
    # Construction des images
    print_info "Construction des images Docker..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    print_success "Images construites"
    
    # Démarrage des services
    print_info "Démarrage des services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Attente que les services soient prêts
    print_info "Vérification que les services sont prêts..."
    sleep 30
    
    # Vérification de la santé des services
    for i in {1..10}; do
        if curl -s http://localhost:3000/health > /dev/null; then
            print_success "Backend API prêt"
            break
        fi
        print_info "Attente du backend... ($i/10)"
        sleep 10
    done
    
    print_success "Services déployés"
}

# ===============================================
# 🔒 Configuration SSL
# ===============================================
setup_ssl() {
    print_header "🔒 CONFIGURATION SSL"
    
    print_info "Installation de Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
    
    print_info "Génération du certificat SSL pour $DOMAIN..."
    certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive
    
    # Configuration du renouvellement automatique
    print_info "Configuration du renouvellement automatique..."
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    print_success "SSL configuré avec succès"
}

# ===============================================
# 🔧 Configuration Nginx
# ===============================================
setup_nginx() {
    print_header "🔧 CONFIGURATION NGINX"
    
    print_info "Installation de Nginx..."
    apt-get update
    apt-get install -y nginx
    
    # Sauvegarde de la configuration par défaut
    cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
    
    # Configuration personnalisée
    cat > /etc/nginx/sites-available/autoaziz << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirection HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # Logs
    access_log /var/log/nginx/autoaziz.access.log;
    error_log /var/log/nginx/autoaziz.error.log;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # API Backend
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gestion des fichiers statiques
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
    
    # Activation du site
    ln -sf /etc/nginx/sites-available/autoaziz /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test de la configuration
    nginx -t
    systemctl reload nginx
    systemctl enable nginx
    
    print_success "Nginx configuré"
}

# ===============================================
# 📊 Configuration du monitoring
# ===============================================
setup_monitoring() {
    print_header "📊 CONFIGURATION DU MONITORING"
    
    # Configuration des services systemd
    print_info "Configuration des services systemd..."
    
    # Service de monitoring
    cat > /etc/systemd/system/autoaziz-monitor.service << EOF
[Unit]
Description=Auto Aziz Monitoring Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/autoaziz
ExecStart=/opt/autoaziz/monitor.sh
Restart=always
RestartSec=300

[Install]
WantedBy=multi-user.target
EOF
    
    # Timer pour le monitoring
    cat > /etc/systemd/system/autoaziz-monitor.timer << EOF
[Unit]
Description=Run Auto Aziz Monitor every 5 minutes
Requires=autoaziz-monitor.service

[Timer]
OnCalendar=*:0/5
Persistent=true

[Install]
WantedBy=timers.target
EOF
    
    # Activation des services
    systemctl daemon-reload
    systemctl enable autoaziz-monitor.timer
    systemctl start autoaziz-monitor.timer
    
    print_success "Monitoring configuré"
}

# ===============================================
# 🔄 Configuration des sauvegardes automatiques
# ===============================================
setup_auto_backup() {
    print_header "🔄 SAUVEGARDES AUTOMATIQUES"
    
    # Script de sauvegarde automatique
    cat > /usr/local/bin/autoaziz-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/autoaziz-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="$BACKUP_DIR/auto_backup_$TIMESTAMP"

mkdir -p "$BACKUP_PATH"

# Sauvegarde base de données
docker exec autoaziz-postgres-1 pg_dump -U autoaziz autoaziz > "$BACKUP_PATH/database.sql"

# Sauvegarde configuration
cp -r /opt/autoaziz/.env* "$BACKUP_PATH/" 2>/dev/null || true

# Compression
cd "$BACKUP_DIR"
tar -czf "auto_backup_$TIMESTAMP.tar.gz" "auto_backup_$TIMESTAMP/"
rm -rf "auto_backup_$TIMESTAMP/"

# Suppression des anciennes sauvegardes (garde 7 jours)
find "$BACKUP_DIR" -name "auto_backup_*.tar.gz" -mtime +7 -delete

echo "Sauvegarde automatique créée: auto_backup_$TIMESTAMP.tar.gz"
EOF
    
    chmod +x /usr/local/bin/autoaziz-backup.sh
    
    # Ajout au crontab
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/autoaziz-backup.sh") | crontab -
    
    print_success "Sauvegardes automatiques configurées (tous les jours à 2h)"
}

# ===============================================
# ✅ Tests post-déploiement
# ===============================================
post_deployment_tests() {
    print_header "✅ TESTS POST-DÉPLOIEMENT"
    
    print_info "Test de l'API de santé..."
    if curl -s "https://$DOMAIN/api/health" | grep -q "ok"; then
        print_success "API de santé fonctionnelle"
    else
        print_error "Échec du test de l'API de santé"
    fi
    
    print_info "Test du frontend..."
    if curl -s "https://$DOMAIN" | grep -q "Auto Aziz"; then
        print_success "Frontend accessible"
    else
        print_warning "Frontend pourrait avoir des problèmes"
    fi
    
    print_info "Test SSL..."
    if echo | openssl s_client -connect "$DOMAIN:443" 2>/dev/null | grep -q "Verify return code: 0"; then
        print_success "Certificat SSL valide"
    else
        print_warning "Problème potentiel avec le certificat SSL"
    fi
    
    print_success "Tests post-déploiement terminés"
}

# ===============================================
# 📋 Résumé du déploiement
# ===============================================
deployment_summary() {
    print_header "📋 RÉSUMÉ DU DÉPLOIEMENT"
    
    print_info "🌐 Site web: https://$DOMAIN"
    print_info "🔧 API: https://$DOMAIN/api"
    print_info "💾 Sauvegardes: $BACKUP_DIR"
    print_info "📝 Logs: $LOG_FILE"
    print_info "📊 Monitoring: systemctl status autoaziz-monitor.timer"
    
    print_success "🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS!"
    
    echo ""
    print_info "📚 Commandes utiles:"
    echo "  • Voir les logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "  • Redémarrer: docker-compose -f docker-compose.prod.yml restart"
    echo "  • Monitoring: ./monitor.sh"
    echo "  • Sauvegarde manuelle: /usr/local/bin/autoaziz-backup.sh"
    echo "  • Status Nginx: systemctl status nginx"
    echo "  • Renouveler SSL: certbot renew"
}

# ===============================================
# 🎯 Fonction principale
# ===============================================
main() {
    clear
    echo -e "${PURPLE}"
    echo "  ██████  ██    ██ ████████  ██████      █████  ███████ ██ ███████ "
    echo " ██    ██ ██    ██    ██    ██    ██    ██   ██    ███  ██    ███  "
    echo " ███████  ██    ██   ██     ██    ██   ███████   ███   ██   ███   "
    echo " ██   ██  ██    ██  ██      ██    ██   ██   ██  ███    ██  ███    "
    echo " ██   ██   ██████  ████████  ██████    ██   ██ ███████ ██ ███████ "
    echo -e "${NC}"
    echo -e "${BLUE}🚗 Auto Aziz - Déploiement en Production${NC}"
    echo ""
    
    # Vérification des droits root
    if [[ $EUID -ne 0 ]]; then
        print_error "Ce script doit être exécuté en tant que root"
        exit 1
    fi
    
    # Confirmation
    echo -e "${YELLOW}⚠️  Vous êtes sur le point de déployer Auto Aziz en production.${NC}"
    echo -e "${YELLOW}   Cette opération va:"
    echo -e "   • Créer une sauvegarde complète"
    echo -e "   • Reconstruire et redéployer l'application"
    echo -e "   • Configurer SSL avec Let's Encrypt"
    echo -e "   • Configurer Nginx comme reverse proxy"
    echo -e "   • Mettre en place le monitoring automatique${NC}"
    echo ""
    read -p "Voulez-vous continuer? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Déploiement annulé"
        exit 0
    fi
    
    # Initialisation du log
    mkdir -p "$(dirname "$LOG_FILE")"
    echo "=== Auto Aziz Production Deployment - $(date) ===" > "$LOG_FILE"
    
    # Exécution des étapes
    pre_deployment_checks
    create_backup
    build_and_deploy
    setup_nginx
    setup_ssl
    setup_monitoring
    setup_auto_backup
    post_deployment_tests
    deployment_summary
}

# ===============================================
# 🎬 Point d'entrée
# ===============================================
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi