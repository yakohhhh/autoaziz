#!/bin/bash

# 🚗 Auto Aziz - Script de monitoring système
# Description: Surveillance de la santé et des performances du système

set -e

# ===============================================
# 🎨 Couleurs pour l'affichage
# ===============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ===============================================
# 📊 Fonctions utilitaires
# ===============================================
print_header() {
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=====================================${NC}"
}

print_status() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

# ===============================================
# 🖥️ Informations système
# ===============================================
check_system_info() {
    print_header "🖥️  INFORMATIONS SYSTÈME"
    
    echo -e "${CYAN}📅 Date:${NC} $(date)"
    echo -e "${CYAN}⏰ Uptime:${NC} $(uptime -p)"
    echo -e "${CYAN}🔧 OS:${NC} $(lsb_release -d | cut -f2)"
    echo -e "${CYAN}💾 Mémoire:${NC}"
    free -h | grep -E "Mem|Swap"
    echo -e "${CYAN}💽 Espace disque:${NC}"
    df -h / | tail -1
    echo -e "${CYAN}🔥 CPU:${NC}"
    top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print "Utilisation: " 100 - $1 "%"}'
}

# ===============================================
# 🐳 Status Docker
# ===============================================
check_docker_status() {
    print_header "🐳 STATUS DOCKER"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker n'est pas installé${NC}"
        return 1
    fi
    
    # Status Docker daemon
    if systemctl is-active --quiet docker; then
        print_status "Docker daemon actif" 0
    else
        print_status "Docker daemon inactif" 1
    fi
    
    # Conteneurs en cours
    echo -e "${CYAN}📦 Conteneurs actifs:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "Aucun conteneur actif"
    
    # Utilisation des ressources
    echo -e "${CYAN}📊 Utilisation des ressources Docker:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null || echo "Pas de stats disponibles"
}

# ===============================================
# 🌐 Vérification des services web
# ===============================================
check_web_services() {
    print_header "🌐 SERVICES WEB"
    
    # Backend API
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        print_status "Backend API (port 3000)" 0
    else
        print_status "Backend API (port 3000)" 1
    fi
    
    # Frontend
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        print_status "Frontend (port 3001)" 0
    else
        print_status "Frontend (port 3001)" 1
    fi
    
    # Base de données
    if docker exec autoaziz-postgres-1 pg_isready -U autoaziz > /dev/null 2>&1; then
        print_status "PostgreSQL Database" 0
    else
        print_status "PostgreSQL Database" 1
    fi
    
    # Nginx (si utilisé)
    if systemctl is-active --quiet nginx; then
        print_status "Nginx reverse proxy" 0
    else
        print_status "Nginx reverse proxy" 1
    fi
}

# ===============================================
# 📝 Logs récents
# ===============================================
check_recent_logs() {
    print_header "📝 LOGS RÉCENTS"
    
    echo -e "${CYAN}🔴 Erreurs système récentes:${NC}"
    journalctl --since "1 hour ago" --priority=err --no-pager | tail -5 || echo "Aucune erreur récente"
    
    echo -e "${CYAN}🐳 Logs Docker récents:${NC}"
    if docker ps -q | head -1 > /dev/null 2>&1; then
        for container in $(docker ps --format "{{.Names}}" | head -3); do
            echo -e "${YELLOW}📦 $container:${NC}"
            docker logs --tail 3 "$container" 2>/dev/null || echo "Pas de logs disponibles"
        done
    else
        echo "Aucun conteneur actif"
    fi
}

# ===============================================
# 🔒 Vérification de sécurité
# ===============================================
check_security() {
    print_header "🔒 SÉCURITÉ"
    
    # Connexions SSH actives
    echo -e "${CYAN}🔐 Connexions SSH actives:${NC}"
    who | grep pts || echo "Aucune connexion SSH active"
    
    # Dernières connexions
    echo -e "${CYAN}📊 Dernières connexions:${NC}"
    last -n 5 | head -5
    
    # Ports ouverts
    echo -e "${CYAN}🌐 Ports ouverts:${NC}"
    ss -tlnp | grep -E ":(80|443|3000|3001|5432|22)\s" || echo "Ports principaux fermés"
    
    # Mises à jour disponibles
    echo -e "${CYAN}📦 Mises à jour disponibles:${NC}"
    apt list --upgradable 2>/dev/null | wc -l | awk '{print $1 " mise(s) à jour disponible(s)"}'
}

# ===============================================
# 🚨 Alertes et recommandations
# ===============================================
check_alerts() {
    print_header "🚨 ALERTES & RECOMMANDATIONS"
    
    # Vérification espace disque
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 80 ]; then
        echo -e "${RED}⚠️  ALERTE: Espace disque utilisé à ${DISK_USAGE}%${NC}"
    fi
    
    # Vérification mémoire
    MEM_USAGE=$(free | awk 'FNR==2{printf "%.0f", $3/($3+$4)*100}')
    if [ "$MEM_USAGE" -gt 80 ]; then
        echo -e "${RED}⚠️  ALERTE: Mémoire utilisée à ${MEM_USAGE}%${NC}"
    fi
    
    # Vérification load average
    LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    CPU_CORES=$(nproc)
    if (( $(echo "$LOAD_AVG > $CPU_CORES" | bc -l) )); then
        echo -e "${RED}⚠️  ALERTE: Load average élevé ($LOAD_AVG)${NC}"
    fi
    
    # Recommandations
    echo -e "${CYAN}💡 Recommandations:${NC}"
    echo "  • Surveiller les logs régulièrement"
    echo "  • Effectuer les mises à jour de sécurité"
    echo "  • Sauvegarder la base de données quotidiennement"
    echo "  • Monitorer les certificats SSL"
}

# ===============================================
# 📧 Fonction principale
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
    echo -e "${BLUE}🚗 Auto Aziz - Monitoring Système${NC}"
    echo ""
    
    check_system_info
    echo ""
    check_docker_status
    echo ""
    check_web_services
    echo ""
    check_recent_logs
    echo ""
    check_security
    echo ""
    check_alerts
    
    echo ""
    echo -e "${GREEN}✅ Monitoring terminé - $(date)${NC}"
}

# ===============================================
# 🎯 Options de ligne de commande
# ===============================================
case "${1:-}" in
    --system)
        check_system_info
        ;;
    --docker)
        check_docker_status
        ;;
    --services)
        check_web_services
        ;;
    --logs)
        check_recent_logs
        ;;
    --security)
        check_security
        ;;
    --alerts)
        check_alerts
        ;;
    --help)
        echo "🚗 Auto Aziz - Script de monitoring"
        echo ""
        echo "Usage: $0 [OPTION]"
        echo ""
        echo "Options:"
        echo "  --system    Informations système uniquement"
        echo "  --docker    Status Docker uniquement"
        echo "  --services  Vérification des services web"
        echo "  --logs      Logs récents uniquement"
        echo "  --security  Vérifications de sécurité"
        echo "  --alerts    Alertes et recommandations"
        echo "  --help      Afficher cette aide"
        echo ""
        echo "Sans option: Monitoring complet"
        ;;
    *)
        main
        ;;
esac