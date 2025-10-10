#!/bin/bash

# 🏗️ Auto Aziz - Configuration serveur de production
# Script complet d'installation et configuration serveur

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
PROJECT_NAME="autoaziz"
PROJECT_DIR="/opt/$PROJECT_NAME"
USER="$PROJECT_NAME"
DOMAIN="${1:-autoaziz.com}"
EMAIL="${2:-admin@autoaziz.com}"

echo -e "${BLUE}"
cat << "EOF"
 🏗️  AUTO AZIZ - SETUP SERVEUR PRODUCTION
========================================
EOF
echo -e "${NC}"

# Vérifications prérequises
if [[ $EUID -ne 0 ]]; then
   log_error "Ce script doit être exécuté en tant que root"
   exit 1
fi

# Mise à jour du système
log_info "Mise à jour du système..."
apt update && apt upgrade -y

# Installation des paquets essentiels
log_info "Installation des paquets essentiels..."
apt install -y \
    curl \
    wget \
    git \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    fail2ban \
    htop \
    tree \
    jq \
    unzip

# Installation de Docker
log_info "Installation de Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Installation de Docker Compose
log_info "Installation de Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Installation de Node.js
log_info "Installation de Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Création de l'utilisateur système
log_info "Création de l'utilisateur $USER..."
if ! id "$USER" &>/dev/null; then
    useradd -r -s /bin/bash -d "$PROJECT_DIR" -m "$USER"
    usermod -aG docker "$USER"
fi

# Création des répertoires
log_info "Création des répertoires..."
mkdir -p "$PROJECT_DIR"
mkdir -p "/var/log/$PROJECT_NAME"
mkdir -p "/opt/backups/$PROJECT_NAME"

# Clone du projet
log_info "Clone du projet..."
if [[ ! -d "$PROJECT_DIR/.git" ]]; then
    git clone https://github.com/votre-username/autoaziz.git "$PROJECT_DIR"
else
    cd "$PROJECT_DIR" && git pull origin main
fi

# Configuration des permissions
chown -R "$USER:$USER" "$PROJECT_DIR"
chown -R "$USER:$USER" "/var/log/$PROJECT_NAME"
chown -R "$USER:$USER" "/opt/backups/$PROJECT_NAME"

# Configuration du firewall
log_info "Configuration du firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 9000/tcp  # Webhook
ufw --force enable

# Configuration de Fail2Ban
log_info "Configuration de Fail2Ban..."
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
systemctl enable fail2ban
systemctl start fail2ban

# Configuration SSL avec Let's Encrypt
log_info "Configuration SSL pour $DOMAIN..."
if [[ "$DOMAIN" != "autoaziz.com" ]]; then
    # Configuration Nginx de base
    cat > /etc/nginx/sites-available/$PROJECT_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /api {
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
}
EOF

    ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    nginx -t && systemctl reload nginx
    
    # Obtenir le certificat SSL
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL
fi

# Installation du service webhook
log_info "Installation du service webhook..."
cp "$PROJECT_DIR/autoaziz-webhook.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable autoaziz-webhook
systemctl start autoaziz-webhook

# Configuration des tâches cron
log_info "Configuration des tâches cron..."
cat > /etc/cron.d/$PROJECT_NAME << EOF
# Auto Aziz - Tâches automatisées
# Backup quotidien à 2h du matin
0 2 * * * $USER cd $PROJECT_DIR && ./deploy.sh backup

# Nettoyage des logs hebdomadaire
0 3 * * 0 root find /var/log/$PROJECT_NAME -name "*.log" -mtime +30 -delete

# Renouvellement SSL mensuel
0 4 1 * * root certbot renew --quiet && systemctl reload nginx
EOF

# Configuration de la rotation des logs
log_info "Configuration de la rotation des logs..."
cat > /etc/logrotate.d/$PROJECT_NAME << EOF
/var/log/$PROJECT_NAME/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 $USER $USER
    postrotate
        systemctl reload autoaziz-webhook
    endscript
}
EOF

# Installation des outils de monitoring
log_info "Installation des outils de monitoring..."
cat > "$PROJECT_DIR/health-check.sh" << 'EOF'
#!/bin/bash
# Script de vérification de santé

# Vérifier les services Docker
if ! docker-compose -f /opt/autoaziz/docker-compose.prod.yml ps | grep -q "Up"; then
    echo "❌ Services Docker en panne" | logger -t autoaziz
    systemctl restart docker
fi

# Vérifier l'espace disque
DISK_USAGE=$(df /opt | tail -1 | awk '{print $5}' | sed 's/%//')
if [[ $DISK_USAGE -gt 80 ]]; then
    echo "⚠️ Espace disque faible: ${DISK_USAGE}%" | logger -t autoaziz
fi

# Vérifier la charge système
LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
if (( $(echo "$LOAD > 2.0" | bc -l) )); then
    echo "⚠️ Charge système élevée: $LOAD" | logger -t autoaziz
fi
EOF

chmod +x "$PROJECT_DIR/health-check.sh"

# Ajouter le health check au cron
echo "*/5 * * * * $USER $PROJECT_DIR/health-check.sh" >> /etc/cron.d/$PROJECT_NAME

# Configuration des variables d'environnement
log_info "Configuration des variables d'environnement..."
if [[ ! -f "$PROJECT_DIR/.env.prod" ]]; then
    cat > "$PROJECT_DIR/.env.prod" << EOF
# 🏭 Auto Aziz - Configuration Production
NODE_ENV=production

# Base de données
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=CHANGEME_STRONG_PASSWORD
DB_DATABASE=autoaziz

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@$DOMAIN

# JWT
JWT_SECRET=CHANGEME_STRONG_JWT_SECRET

# Frontend
REACT_APP_API_URL=https://$DOMAIN

# Monitoring
GRAFANA_PASSWORD=CHANGEME_GRAFANA_PASSWORD

# Webhook
GITHUB_WEBHOOK_SECRET=CHANGEME_WEBHOOK_SECRET
EOF

    log_warning "⚠️ Configurez les variables dans $PROJECT_DIR/.env.prod"
fi

# Démarrage des services
log_info "Démarrage des services..."
cd "$PROJECT_DIR"
sudo -u "$USER" docker-compose -f docker-compose.prod.yml up -d

# Configuration du monitoring avec Netdata (optionnel)
log_info "Installation de Netdata pour le monitoring..."
bash <(curl -Ss https://my-netdata.io/kickstart.sh) --dont-wait --stable-channel

# Résumé final
echo -e "\n${GREEN}🎉 Installation serveur terminée !${NC}\n"

echo -e "${BLUE}📋 Services installés :${NC}"
echo -e "  ✅ Docker & Docker Compose"
echo -e "  ✅ Nginx avec SSL (Let's Encrypt)"
echo -e "  ✅ Firewall (UFW) configuré"
echo -e "  ✅ Fail2Ban pour la sécurité"
echo -e "  ✅ Service webhook GitHub"
echo -e "  ✅ Rotation des logs"
echo -e "  ✅ Tâches cron automatisées"
echo -e "  ✅ Monitoring Netdata"

echo -e "\n${BLUE}🔗 URLs disponibles :${NC}"
echo -e "  🌐 Site web: https://$DOMAIN"
echo -e "  📊 Netdata: https://$DOMAIN:19999"
echo -e "  🔧 Webhook: https://$DOMAIN:9000/webhook"

echo -e "\n${BLUE}📝 Configuration requise :${NC}"
echo -e "  1. Éditez $PROJECT_DIR/.env.prod"
echo -e "  2. Configurez le webhook GitHub"
echo -e "  3. Testez le déploiement: cd $PROJECT_DIR && ./deploy.sh"

echo -e "\n${BLUE}🔧 Commandes utiles :${NC}"
echo -e "  systemctl status autoaziz-webhook"
echo -e "  docker-compose -f $PROJECT_DIR/docker-compose.prod.yml logs"
echo -e "  tail -f /var/log/$PROJECT_NAME/webhook.log"

log_success "Serveur Auto Aziz configuré avec succès !"