#!/bin/bash

# 🚀 Auto Aziz - Installation automatique
# Ce script installe et configure automatiquement le projet complet

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
   ___        __           ___          _     
  / _ |__ __ / /_ ___    / _ |___ __ __(_)___ 
 / __ / // / __// _ \  / __ /_  // // //_  / 
/_/ |_\_,_/\__/ \___/ /_/ |_//__/\_,_/ /___/  
                                             
🚗 Installation Automatique - Système Professionnel
EOF
echo -e "${NC}"

# Vérification des prérequis
log_info "Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js n'est pas installé. Installation..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    log_success "Node.js $(node --version) détecté"
fi

# Vérifier npm
if ! command -v npm &> /dev/null; then
    log_error "npm n'est pas installé"
    exit 1
else
    log_success "npm $(npm --version) détecté"
fi

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    log_warning "Docker n'est pas installé. Installation..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    log_warning "Veuillez redémarrer votre session pour utiliser Docker sans sudo"
else
    log_success "Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1) détecté"
fi

# Vérifier Docker Compose
if ! command -v docker-compose &> /dev/null; then
    log_warning "Docker Compose n'est pas installé. Installation..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    log_success "Docker Compose $(docker-compose --version | cut -d' ' -f4 | cut -d',' -f1) détecté"
fi

# Installation des dépendances backend
log_info "Installation des dépendances backend..."
cd apps/backend
npm install --production=false
log_success "Dépendances backend installées"

# Installation des dépendances frontend
log_info "Installation des dépendances frontend..."
cd ../frontend
npm install
log_success "Dépendances frontend installées"

cd ..

# Configuration de l'environnement
log_info "Configuration de l'environnement..."

# Copie et configuration du .env backend
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    log_warning "Fichier .env créé depuis .env.example"
    log_warning "⚠️  IMPORTANT: Configurez vos variables d'environnement dans backend/.env"
    log_warning "   - SMTP_PASSWORD: Utilisez un Gmail App Password"
    log_warning "   - DB_*: Configurez votre base de données"
else
    log_success "Fichier .env existe déjà"
fi

# Configuration de la base de données avec Docker
log_info "Démarrage de la base de données PostgreSQL..."
docker-compose up -d postgres
sleep 5
log_success "Base de données PostgreSQL démarrée"

# Installation des outils de développement globaux
log_info "Installation des outils de développement..."
npm install -g @nestjs/cli typescript ts-node nodemon
log_success "Outils de développement installés"

# Configuration Git hooks (si c'est un repo git)
if [ -d ".git" ]; then
    log_info "Configuration des Git hooks..."
    
    # Créer le dossier hooks s'il n'existe pas
    mkdir -p .git/hooks
    
    # Hook pre-commit
    cat > .git/hooks/pre-commit << 'EOL'
#!/bin/bash
echo "🔍 Vérification pre-commit..."

# Vérifier le linting backend
cd apps/backend
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Erreurs de linting backend détectées"
    exit 1
fi

# Vérifier les tests backend
npm run test
if [ $? -ne 0 ]; then
    echo "❌ Tests backend échoués"
    exit 1
fi

cd ../frontend
# Vérifier le build frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build frontend échoué"
    exit 1
fi

echo "✅ Pre-commit validé"
EOL

    chmod +x .git/hooks/pre-commit
    log_success "Git hooks configurés"
fi

# Build initial
log_info "Build initial du projet..."
cd apps/backend && npm run build
cd ../frontend && npm run build
cd ../..
log_success "Build initial terminé"

# Configuration des scripts npm globaux
log_info "Configuration des scripts de développement..."
cat > package.json << 'EOF'
{
  "name": "autoaziz-workspace",
  "version": "1.0.0",
  "description": "Auto Aziz - Système de gestion de rendez-vous avec vérification",
  "scripts": {
    "install:all": "npm install && cd apps/backend && npm install && cd ../frontend && npm install",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd apps/backend && npm run start:dev",
    "dev:frontend": "cd apps/frontend && npm start",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "cd apps/backend && npm run build",
    "build:frontend": "cd apps/frontend && npm run build",
    "test": "npm run test:backend && npm run test:frontend",
    "test:backend": "cd apps/backend && npm run test",
    "test:frontend": "cd apps/frontend && npm test -- --watchAll=false",
    "lint": "npm run lint:backend && npm run lint:frontend",
    "lint:backend": "cd apps/backend && npm run lint",
    "lint:frontend": "cd apps/frontend && npm run lint || true",
    "docker:dev": "docker-compose up --build",
    "docker:prod": "docker-compose -f docker-compose.prod.yml up --build",
    "clean": "rm -rf node_modules apps/backend/node_modules apps/frontend/node_modules apps/backend/dist apps/frontend/build",
    "reset": "npm run clean && npm run install:all"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/votre-username/autoaziz.git"
  },
  "keywords": [
    "auto",
    "garage",
    "appointments",
    "verification",
    "nestjs",
    "react",
    "typescript"
  ],
  "author": "Auto Aziz Team",
  "license": "MIT"
}
EOF

npm install
log_success "Scripts de développement configurés"

# Résumé final
# ===============================================
# 🔧 Configuration des hooks Git et ESLint
# ===============================================
setup_git_hooks() {
    print_header "🔧 CONFIGURATION DES HOOKS GIT"
    
    if [ -d ".git" ]; then
        print_info "Configuration des hooks Git pour la qualité du code..."
        ./setup-git-hooks.sh
        print_success "Hooks Git configurés"
    else
        print_info "Pas de repository Git détecté, hooks ignorés"
    fi
}

# ===============================================
# 🔍 Test ESLint
# ===============================================
test_eslint() {
    print_header "🔍 TEST ESLINT"
    
    print_info "Test de la configuration ESLint..."
    ./lint.sh --stats
    
    print_info "Application de corrections automatiques..."
    ./lint.sh --fix
    
    print_success "Configuration ESLint validée"
}

print_success "✅ Installation terminée avec succès!"

# Configuration supplémentaire
setup_git_hooks
test_eslint

echo ""
print_success "🎉 Auto Aziz est prêt à l'emploi!"
echo ""
print_info "🚀 Prochaines étapes:"
echo "1. Configurez vos variables d'environnement dans backend/.env"
echo "2. Démarrez les services: docker-compose up -d"
echo "3. Accédez à l'application: http://localhost:3001"
echo "4. Consultez la documentation API: http://localhost:3000/api"
echo "5. Utilisez './lint.sh --fix' pour corriger le code automatiquement"

echo -e "${BLUE}📋 Commandes disponibles :${NC}"
echo -e "  ${YELLOW}npm run dev${NC}           - Démarrer en mode développement"
echo -e "  ${YELLOW}npm run build${NC}         - Build de production"
echo -e "  ${YELLOW}npm run test${NC}          - Lancer tous les tests"
echo -e "  ${YELLOW}npm run docker:dev${NC}    - Démarrer avec Docker (dev)"
echo -e "  ${YELLOW}npm run docker:prod${NC}   - Démarrer avec Docker (prod)"

echo -e "\n${BLUE}🔧 Configuration requise :${NC}"
echo -e "  1. Éditez ${YELLOW}backend/.env${NC} avec vos variables"
echo -e "  2. Configurez votre Gmail App Password"
echo -e "  3. Vérifiez la configuration de la base de données"

echo -e "\n${BLUE}🚀 Pour démarrer :${NC}"
echo -e "  ${GREEN}npm run dev${NC}"

echo -e "\n${BLUE}📚 Documentation :${NC}"
echo -e "  - README.md - Documentation générale"
echo -e "  - VERIFICATION_SYSTEM_GUIDE.md - Guide du système de vérification"
echo -e "  - GMAIL_FIX_GUIDE.md - Configuration Gmail"

log_success "Installation Auto Aziz terminée !"