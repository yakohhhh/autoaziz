#!/bin/bash

# 🚗 Auto Aziz - Test de CI/CD Local
# Description: Simule la pipeline CI/CD en local pour valider avant push

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
NC='\033[0m'

# ===============================================
# 📝 Fonctions utilitaires
# ===============================================
print_header() {
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=====================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# ===============================================
# 🔍 Tests ESLint/Prettier
# ===============================================
test_linting() {
    print_header "🔍 TESTS DE LINTING"
    
    print_info "Vérification ESLint Backend..."
    cd backend
    npm run lint:check || {
        print_error "ESLint Backend failed"
        return 1
    }
    cd ..
    
    print_info "Vérification ESLint Frontend..."
    cd frontend
    npm run lint:check || {
        print_error "ESLint Frontend failed"
        return 1
    }
    cd ..
    
    print_info "Vérification Prettier Backend..."
    cd backend
    npm run format:check || {
        print_error "Prettier Backend failed"
        return 1
    }
    cd ..
    
    print_info "Vérification Prettier Frontend..."
    cd frontend
    npm run format:check || {
        print_error "Prettier Frontend failed"
        return 1
    }
    cd ..
    
    print_success "Tous les tests de linting passés"
}

# ===============================================
# 🏗️ Tests de Build
# ===============================================
test_builds() {
    print_header "🏗️ TESTS DE BUILD"
    
    print_info "Build Backend..."
    cd backend
    npm run build || {
        print_error "Backend build failed"
        return 1
    }
    cd ..
    
    print_info "Build Frontend..."
    cd frontend
    npm run build || {
        print_error "Frontend build failed"
        return 1
    }
    cd ..
    
    print_success "Tous les builds réussis"
}

# ===============================================
# 🧪 Tests Unitaires
# ===============================================
test_units() {
    print_header "🧪 TESTS UNITAIRES"
    
    print_info "Tests Backend..."
    cd backend
    npm run test || {
        print_error "Backend tests failed"
        return 1
    }
    cd ..
    
    print_info "Tests Frontend..."
    cd frontend
    npm test -- --coverage --watchAll=false || {
        print_error "Frontend tests failed"
        return 1
    }
    cd ..
    
    print_success "Tous les tests unitaires passés"
}

# ===============================================
# 🔒 Tests de Sécurité
# ===============================================
test_security() {
    print_header "🔒 TESTS DE SÉCURITÉ"
    
    print_info "Audit sécurité Backend..."
    cd backend
    npm audit --audit-level moderate || {
        print_error "Backend security audit failed"
        return 1
    }
    cd ..
    
    print_info "Audit sécurité Frontend..."
    cd frontend
    npm audit --audit-level moderate || {
        print_error "Frontend security audit failed"
        return 1
    }
    cd ..
    
    print_success "Tous les audits de sécurité passés"
}

# ===============================================
# 🐳 Tests Docker
# ===============================================
test_docker() {
    print_header "🐳 TESTS DOCKER"
    
    print_info "Build Docker Backend..."
    docker build -f backend/Dockerfile -t autoaziz-backend-test backend/ || {
        print_error "Docker backend build failed"
        return 1
    }
    
    print_info "Build Docker Frontend..."
    docker build -f frontend/Dockerfile -t autoaziz-frontend-test frontend/ || {
        print_error "Docker frontend build failed"
        return 1
    }
    
    # Nettoyage des images de test
    docker rmi autoaziz-backend-test autoaziz-frontend-test 2>/dev/null || true
    
    print_success "Tous les builds Docker réussis"
}

# ===============================================
# 📊 Résumé des résultats
# ===============================================
show_summary() {
    print_header "📊 RÉSUMÉ CI/CD LOCAL"
    
    print_success "🔍 Linting: PASSED"
    print_success "🏗️ Builds: PASSED"
    print_success "🧪 Tests: PASSED"
    print_success "🔒 Security: PASSED"
    print_success "🐳 Docker: PASSED"
    
    echo ""
    print_info "🚀 Votre code est prêt pour le push !"
    echo ""
    print_info "Commandes de push suggérées :"
    echo "  git add ."
    echo "  git commit -m 'feat: correction des erreurs ESLint et amélioration CI/CD'"
    echo "  git push origin main"
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
    echo -e "${BLUE}🚗 Auto Aziz - Test CI/CD Local${NC}"
    echo ""
    
    # Vérification des prérequis
    if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
        print_error "Dossiers backend/frontend non trouvés"
        exit 1
    fi
    
    case "${1:-}" in
        --lint)
            test_linting
            ;;
        --build)
            test_builds
            ;;
        --test)
            test_units
            ;;
        --security)
            test_security
            ;;
        --docker)
            test_docker
            ;;
        --help)
            echo "🚗 Auto Aziz - Test CI/CD Local"
            echo ""
            echo "Usage: $0 [OPTION]"
            echo ""
            echo "Options:"
            echo "  --lint      Tests de linting uniquement"
            echo "  --build     Tests de build uniquement"
            echo "  --test      Tests unitaires uniquement"
            echo "  --security  Audits de sécurité uniquement"
            echo "  --docker    Tests Docker uniquement"
            echo "  --help      Afficher cette aide"
            echo ""
            echo "Sans option: Pipeline complète"
            ;;
        *)
            print_info "🔥 Exécution de la pipeline CI/CD complète..."
            echo ""
            
            test_linting
            echo ""
            test_builds
            echo ""
            test_units
            echo ""
            test_security
            echo ""
            test_docker
            echo ""
            show_summary
            ;;
    esac
}

# ===============================================
# 🎬 Point d'entrée
# ===============================================
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi