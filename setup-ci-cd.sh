#!/bin/bash

# 🚗 Auto Aziz - Configuration CI/CD
# Description: Choisir entre CI/CD complète ou simplifiée

set -e

# ===============================================
# 🎨 Couleurs
# ===============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${PURPLE}"
echo "  ██████  ██    ██ ████████  ██████      █████  ███████ ██ ███████ "
echo " ██    ██ ██    ██    ██    ██    ██    ██   ██    ███  ██    ███  "
echo " ███████  ██    ██   ██     ██    ██   ███████   ███   ██   ███   "
echo " ██   ██  ██    ██  ██      ██    ██   ██   ██  ███    ██  ███    "
echo " ██   ██   ██████  ████████  ██████    ██   ██ ███████ ██ ███████ "
echo -e "${NC}"
echo -e "${BLUE}🚗 Auto Aziz - Configuration CI/CD${NC}"
echo ""

echo -e "${YELLOW}Choisissez votre configuration CI/CD :${NC}"
echo ""
echo -e "${GREEN}1) 🚀 CI/CD Simplifiée (Recommandée pour débuter)${NC}"
echo "   ✅ Tests ESLint + Prettier"
echo "   ✅ Tests unitaires"
echo "   ✅ Builds Backend + Frontend"
echo "   ✅ Audit de sécurité"
echo "   ✅ Test build Docker"
echo "   ❌ Pas de déploiement automatique"
echo "   📝 Aucun secret GitHub requis"
echo ""
echo -e "${BLUE}2) 🏭 CI/CD Complète (Pour production)${NC}"
echo "   ✅ Tout ce qui est dans la version simplifiée"
echo "   ✅ Déploiement automatique sur serveur"
echo "   ✅ Notifications Slack"
echo "   🔐 Secrets GitHub requis:"
echo "      • SSH_PRIVATE_KEY"
echo "      • HOST"
echo "      • USERNAME"
echo "      • SLACK_WEBHOOK (optionnel)"
echo ""
echo -e "${CYAN}3) 📚 Voir le guide des secrets GitHub${NC}"
echo ""

read -p "Votre choix (1, 2, ou 3): " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}✅ Configuration CI/CD Simplifiée sélectionnée${NC}"
        echo ""
        
        # Sauvegarde de l'ancienne version
        if [ -f ".github/workflows/ci-cd.yml" ]; then
            mv ".github/workflows/ci-cd.yml" ".github/workflows/ci-cd-complete.yml.backup"
            echo -e "${YELLOW}📝 Ancienne configuration sauvée dans ci-cd-complete.yml.backup${NC}"
        fi
        
        # Activation de la version simplifiée
        mv ".github/workflows/ci-cd-simple.yml" ".github/workflows/ci-cd.yml"
        
        echo -e "${GREEN}✅ CI/CD Simplifiée activée !${NC}"
        echo ""
        echo -e "${BLUE}🚀 Vous pouvez maintenant pusher votre code :${NC}"
        echo "   git add ."
        echo "   git commit -m 'feat: configuration CI/CD simplifiée'"
        echo "   git push origin main"
        echo ""
        echo -e "${GREEN}✅ La CI/CD fonctionnera sans aucun secret requis !${NC}"
        ;;
        
    2)
        echo ""
        echo -e "${BLUE}🏭 Configuration CI/CD Complète sélectionnée${NC}"
        echo ""
        
        # Sauvegarde de la version simplifiée
        if [ -f ".github/workflows/ci-cd-simple.yml" ]; then
            mv ".github/workflows/ci-cd-simple.yml" ".github/workflows/ci-cd-simple.yml.backup"
        fi
        
        echo -e "${YELLOW}⚠️  Vous devez configurer les secrets GitHub :${NC}"
        echo ""
        echo -e "${CYAN}📍 Allez sur GitHub → Settings → Secrets and variables → Actions${NC}"
        echo ""
        echo -e "${GREEN}🔐 Secrets requis :${NC}"
        echo "   • SSH_PRIVATE_KEY : Clé SSH pour se connecter au serveur"
        echo "   • HOST : Adresse IP ou domaine du serveur"
        echo "   • USERNAME : Nom d'utilisateur SSH"
        echo "   • SLACK_WEBHOOK : URL webhook Slack (optionnel)"
        echo ""
        echo -e "${BLUE}📚 Consultez GITHUB_SECRETS_GUIDE.md pour les détails${NC}"
        echo ""
        echo -e "${GREEN}✅ CI/CD Complète prête (configurez les secrets avant de pusher)${NC}"
        ;;
        
    3)
        echo ""
        echo -e "${CYAN}📚 Consultation du guide des secrets...${NC}"
        echo ""
        if [ -f "GITHUB_SECRETS_GUIDE.md" ]; then
            cat GITHUB_SECRETS_GUIDE.md
        else
            echo -e "${RED}❌ Guide non trouvé${NC}"
        fi
        ;;
        
    *)
        echo ""
        echo -e "${RED}❌ Choix invalide${NC}"
        exit 1
        ;;
esac