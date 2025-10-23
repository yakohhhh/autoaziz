#!/bin/bash

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║                                                                  ║${NC}"
echo -e "${RED}║              ${YELLOW}🛑 ARRÊT DES SERVICES AUTOSUR${RED}                      ║${NC}"
echo -e "${RED}║                                                                  ║${NC}"
echo -e "${RED}╚══════════════════════════════════════════════════════════════════╝${NC}"

echo ""

# Fonction pour tuer un processus sur un port
kill_port() {
    PORT=$1
    NAME=$2
    
    PID=$(lsof -ti:$PORT 2>/dev/null)
    
    if [ -n "$PID" ]; then
        echo -e "${YELLOW}🛑 Arrêt de ${NAME} (Port ${PORT}, PID ${PID})...${NC}"
        kill -9 $PID 2>/dev/null
        sleep 1
        
        # Vérifier si le processus est arrêté
        if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${RED}   ✗ Échec de l'arrêt${NC}"
        else
            echo -e "${GREEN}   ✓ Arrêté avec succès${NC}"
        fi
    else
        echo -e "${BLUE}   ℹ ${NAME} (Port ${PORT}) n'est pas actif${NC}"
    fi
}

# Arrêter le frontend
kill_port 3000 "Frontend"

# Arrêter le backend
kill_port 3001 "Backend"

# Tuer tous les processus node/npm restants liés au projet
echo ""
echo -e "${YELLOW}🧹 Nettoyage des processus restants...${NC}"

PIDS=$(ps aux | grep -E "(npm|node).*autoaziz" | grep -v grep | awk '{print $2}')

if [ -n "$PIDS" ]; then
    for PID in $PIDS; do
        echo -e "${YELLOW}   → Arrêt du processus ${PID}${NC}"
        kill -9 $PID 2>/dev/null
    done
    echo -e "${GREEN}   ✓ Nettoyage terminé${NC}"
else
    echo -e "${BLUE}   ℹ Aucun processus à nettoyer${NC}"
fi

# Nettoyer les logs
echo ""
echo -e "${YELLOW}🗑️  Nettoyage des logs...${NC}"

if [ -f /tmp/autoaziz-backend.log ]; then
    rm /tmp/autoaziz-backend.log
    echo -e "${GREEN}   ✓ Backend logs supprimés${NC}"
fi

if [ -f /tmp/autoaziz-frontend.log ]; then
    rm /tmp/autoaziz-frontend.log
    echo -e "${GREEN}   ✓ Frontend logs supprimés${NC}"
fi

# Optionnel: Arrêter PostgreSQL
echo ""
read -p "Voulez-vous aussi arrêter PostgreSQL? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🗄️  Arrêt de PostgreSQL...${NC}"
    sudo systemctl stop postgresql
    
    if sudo systemctl is-active postgresql &> /dev/null; then
        echo -e "${RED}   ✗ Échec de l'arrêt de PostgreSQL${NC}"
    else
        echo -e "${GREEN}   ✓ PostgreSQL arrêté${NC}"
    fi
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                                  ║${NC}"
echo -e "${GREEN}║              ${BLUE}✅ TOUS LES SERVICES SONT ARRÊTÉS${GREEN}                ║${NC}"
echo -e "${GREEN}║                                                                  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${BLUE}Pour relancer tous les services:${NC}"
echo -e "   ${YELLOW}→${NC} ${BLUE}./launch-all.sh${NC}"
echo ""
