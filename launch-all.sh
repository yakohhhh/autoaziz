#!/bin/bash

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear

echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                                  ║${NC}"
echo -e "${PURPLE}║                 ${CYAN}🚀 AUTOSUR - LAUNCHER${PURPLE}                          ║${NC}"
echo -e "${PURPLE}║                                                                  ║${NC}"
echo -e "${PURPLE}║         ${GREEN}Démarrage automatique de tous les services${PURPLE}           ║${NC}"
echo -e "${PURPLE}║                                                                  ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${BLUE}📋 Services à démarrer:${NC}"
echo -e "   ${GREEN}✓${NC} PostgreSQL"
echo -e "   ${GREEN}✓${NC} Backend (NestJS)"
echo -e "   ${GREEN}✓${NC} Frontend (React)"
echo ""

# Fonction pour vérifier si un port est utilisé
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Vérifier les ports
echo -e "${YELLOW}🔍 Vérification des ports...${NC}"

if check_port 3001; then
    echo -e "   ${RED}✗${NC} Port 3001 (Backend) déjà utilisé"
    echo -e "     ${YELLOW}→ Un backend est peut-être déjà lancé${NC}"
    read -p "   Continuer quand même? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "   ${GREEN}✓${NC} Port 3001 (Backend) disponible"
fi

if check_port 3000; then
    echo -e "   ${RED}✗${NC} Port 3000 (Frontend) déjà utilisé"
    echo -e "     ${YELLOW}→ Un frontend est peut-être déjà lancé${NC}"
    read -p "   Continuer quand même? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "   ${GREEN}✓${NC} Port 3000 (Frontend) disponible"
fi

echo ""

# Démarrer PostgreSQL
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}🗄️  ÉTAPE 1/3: PostgreSQL${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"

if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL n'est pas installé${NC}"
    echo -e "${YELLOW}📦 Installation de PostgreSQL...${NC}"
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
fi

PG_STATUS=$(sudo systemctl is-active postgresql 2>/dev/null)

if [ "$PG_STATUS" != "active" ]; then
    echo -e "${YELLOW}⚡ Démarrage de PostgreSQL...${NC}"
    sudo systemctl start postgresql
    sleep 2
    
    if sudo systemctl is-active postgresql &> /dev/null; then
        echo -e "${GREEN}✅ PostgreSQL démarré avec succès${NC}"
    else
        echo -e "${RED}❌ Erreur lors du démarrage de PostgreSQL${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ PostgreSQL est déjà actif${NC}"
fi

# Vérifier/Créer la base de données
DB_EXISTS=$(sudo -u postgres psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -w autoaziz | wc -l)

if [ $DB_EXISTS -eq 0 ]; then
    echo -e "${YELLOW}📝 Création de la base de données...${NC}"
    sudo -u postgres psql -c "CREATE DATABASE autoaziz;" 2>/dev/null
    sudo -u postgres psql -c "CREATE USER autoaziz_user WITH PASSWORD 'autoaziz_password';" 2>/dev/null
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE autoaziz TO autoaziz_user;" 2>/dev/null
    echo -e "${GREEN}✅ Base de données créée${NC}"
else
    echo -e "${GREEN}✅ Base de données 'autoaziz' existe${NC}"
fi

echo ""
sleep 1

# Démarrer le Backend
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}🔧 ÉTAPE 2/3: Backend (NestJS)${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"

cd /home/depop/delivery/part-time/autoaziz/apps/backend

# Vérifier le fichier .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Création du fichier .env...${NC}"
    cat > .env << 'EOF'
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=autoaziz_user
DB_PASSWORD=autoaziz_password
DB_DATABASE=autoaziz

# Server
PORT=3001

# JWT
JWT_SECRET=your-secret-key-change-this-in-production

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Twilio SMS
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-phone-number
EOF
    echo -e "${GREEN}✅ Fichier .env créé${NC}"
fi

# Installer les dépendances si nécessaire
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}📦 Installation des dépendances backend...${NC}"
    npm install
fi

echo -e "${GREEN}🚀 Lancement du backend en arrière-plan...${NC}"
npm run start:dev > /tmp/autoaziz-backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${BLUE}   PID: ${BACKEND_PID}${NC}"
echo -e "${BLUE}   Logs: /tmp/autoaziz-backend.log${NC}"

# Attendre que le backend démarre
echo -e "${YELLOW}⏳ Attente du démarrage du backend...${NC}"
for i in {1..30}; do
    if check_port 3001; then
        echo -e "${GREEN}✅ Backend démarré sur http://localhost:3001${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Le backend n'a pas démarré après 30 secondes${NC}"
        echo -e "${YELLOW}   Consultez les logs: tail -f /tmp/autoaziz-backend.log${NC}"
        exit 1
    fi
    sleep 1
    echo -n "."
done

echo ""
sleep 1

# Démarrer le Frontend
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}🌐 ÉTAPE 3/3: Frontend (React)${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"

cd /home/depop/delivery/part-time/autoaziz/apps/frontend

# Vérifier le fichier .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Création du fichier .env...${NC}"
    cat > .env << 'EOF'
REACT_APP_API_URL=http://localhost:3001
REACT_APP_NAME=AUTOSUR
EOF
    echo -e "${GREEN}✅ Fichier .env créé${NC}"
fi

# Installer les dépendances si nécessaire
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}📦 Installation des dépendances frontend...${NC}"
    npm install
fi

echo -e "${GREEN}🚀 Lancement du frontend en arrière-plan...${NC}"
npm start > /tmp/autoaziz-frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${BLUE}   PID: ${FRONTEND_PID}${NC}"
echo -e "${BLUE}   Logs: /tmp/autoaziz-frontend.log${NC}"

# Attendre que le frontend démarre
echo -e "${YELLOW}⏳ Attente du démarrage du frontend...${NC}"
for i in {1..60}; do
    if check_port 3000; then
        echo -e "${GREEN}✅ Frontend démarré sur http://localhost:3000${NC}"
        break
    fi
    if [ $i -eq 60 ]; then
        echo -e "${RED}❌ Le frontend n'a pas démarré après 60 secondes${NC}"
        echo -e "${YELLOW}   Consultez les logs: tail -f /tmp/autoaziz-frontend.log${NC}"
        exit 1
    fi
    sleep 1
    echo -n "."
done

echo ""
sleep 1

# Résumé final
clear
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                                  ║${NC}"
echo -e "${GREEN}║              ${CYAN}✅ TOUS LES SERVICES SONT DÉMARRÉS !${GREEN}              ║${NC}"
echo -e "${GREEN}║                                                                  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${BLUE}📊 Services actifs:${NC}"
echo -e "   ${GREEN}✓${NC} PostgreSQL     → ${CYAN}localhost:5432${NC}"
echo -e "   ${GREEN}✓${NC} Backend        → ${CYAN}http://localhost:3001${NC} (PID: ${BACKEND_PID})"
echo -e "   ${GREEN}✓${NC} Frontend       → ${CYAN}http://localhost:3000${NC} (PID: ${FRONTEND_PID})"

echo ""
echo -e "${PURPLE}🔐 Connexion au dashboard:${NC}"
echo -e "   ${YELLOW}→${NC} URL:      ${CYAN}http://localhost:3000/login${NC}"
echo -e "   ${YELLOW}→${NC} Email:    ${CYAN}admin@autosur.com${NC}"
echo -e "   ${YELLOW}→${NC} Password: ${CYAN}admin123${NC}"

echo ""
echo -e "${BLUE}📝 Commandes utiles:${NC}"
echo -e "   ${YELLOW}→${NC} Logs backend:   ${CYAN}tail -f /tmp/autoaziz-backend.log${NC}"
echo -e "   ${YELLOW}→${NC} Logs frontend:  ${CYAN}tail -f /tmp/autoaziz-frontend.log${NC}"
echo -e "   ${YELLOW}→${NC} Arrêter tout:   ${CYAN}./scripts/stop-all.sh${NC}"
echo -e "   ${YELLOW}→${NC} Tuer backend:   ${CYAN}kill ${BACKEND_PID}${NC}"
echo -e "   ${YELLOW}→${NC} Tuer frontend:  ${CYAN}kill ${FRONTEND_PID}${NC}"

echo ""
echo -e "${GREEN}🎉 L'application est prête à être utilisée !${NC}"
echo ""

# Ouvrir le navigateur automatiquement (optionnel)
read -p "Voulez-vous ouvrir le navigateur automatiquement? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:3000/login &
    elif command -v open &> /dev/null; then
        open http://localhost:3000/login &
    else
        echo -e "${YELLOW}   Ouvrez manuellement: http://localhost:3000/login${NC}"
    fi
fi

echo ""
echo -e "${CYAN}Appuyez sur Ctrl+C pour voir les logs en temps réel...${NC}"
echo ""

# Suivre les logs
trap 'echo -e "\n${YELLOW}Pour arrêter tous les services: kill ${BACKEND_PID} ${FRONTEND_PID}${NC}"; exit' INT

tail -f /tmp/autoaziz-backend.log /tmp/autoaziz-frontend.log
