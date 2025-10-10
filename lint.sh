#!/bin/bash

# 🚗 Auto Aziz - Script ESLint Global
# Description: Exécution d'ESLint sur tous les projets

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
# 🔍 ESLint Backend
# ===============================================
lint_backend() {
    print_header "🔧 ESLINT BACKEND"
    
    if [ ! -d "backend" ]; then
        print_error "Dossier backend non trouvé"
        return 1
    fi
    
    cd backend
    
    if [ "$1" = "--fix" ]; then
        print_info "Correction automatique des erreurs backend..."
        npm run lint || true
    else
        print_info "Vérification du code backend..."
        npm run lint:check || true
    fi
    
    cd ..
    print_success "ESLint backend terminé"
}

# ===============================================
# ⚛️ ESLint Frontend
# ===============================================
lint_frontend() {
    print_header "⚛️ ESLINT FRONTEND"
    
    if [ ! -d "frontend" ]; then
        print_error "Dossier frontend non trouvé"
        return 1
    fi
    
    cd frontend
    
    if [ "$1" = "--fix" ]; then
        print_info "Correction automatique des erreurs frontend..."
        npm run lint || true
    else
        print_info "Vérification du code frontend..."
        npm run lint:check || true
    fi
    
    cd ..
    print_success "ESLint frontend terminé"
}

# ===============================================
# 📊 Statistiques ESLint
# ===============================================
show_stats() {
    print_header "📊 STATISTIQUES ESLINT"
    
    echo -e "${CYAN}Backend:${NC}"
    cd backend && npm run lint:check 2>&1 | grep -E "problems|errors|warnings" | tail -1 || echo "Aucune statistique disponible"
    cd ..
    
    echo -e "${CYAN}Frontend:${NC}"
    cd frontend && npm run lint:check 2>&1 | grep -E "problems|errors|warnings" | tail -1 || echo "Aucune statistique disponible"
    cd ..
}

# ===============================================
# 🧹 Formatage avec Prettier
# ===============================================
format_code() {
    print_header "🧹 FORMATAGE PRETTIER"
    
    print_info "Formatage du backend..."
    cd backend
    npm run format || print_error "Erreur formatage backend"
    cd ..
    
    print_info "Formatage du frontend..."
    cd frontend
    npm run format || print_error "Erreur formatage frontend"
    cd ..
    
    print_success "Formatage terminé"
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
    echo -e "${BLUE}🚗 Auto Aziz - ESLint Global${NC}"
    echo ""
    
    case "${1:-}" in
        --fix)
            print_info "Mode correction automatique activé"
            lint_backend --fix
            echo ""
            lint_frontend --fix
            echo ""
            print_success "Toutes les corrections automatiques appliquées !"
            ;;
        --format)
            format_code
            ;;
        --stats)
            show_stats
            ;;
        --backend)
            lint_backend "${2:-}"
            ;;
        --frontend)
            lint_frontend "${2:-}"
            ;;
        --help)
            echo "🚗 Auto Aziz - Script ESLint Global"
            echo ""
            echo "Usage: $0 [OPTION]"
            echo ""
            echo "Options:"
            echo "  --fix       Correction automatique des erreurs ESLint"
            echo "  --format    Formatage du code avec Prettier"
            echo "  --stats     Affichage des statistiques ESLint"
            echo "  --backend   ESLint backend uniquement (ajouter --fix pour corriger)"
            echo "  --frontend  ESLint frontend uniquement (ajouter --fix pour corriger)"
            echo "  --help      Afficher cette aide"
            echo ""
            echo "Sans option: Vérification complète sans correction"
            echo ""
            echo "Exemples:"
            echo "  $0                    # Vérification complète"
            echo "  $0 --fix             # Correction automatique complète"
            echo "  $0 --backend --fix   # Correction backend uniquement"
            echo "  $0 --format          # Formatage Prettier"
            ;;
        *)
            print_info "Mode vérification (sans correction)"
            lint_backend
            echo ""
            lint_frontend
            echo ""
            show_stats
            echo ""
            echo -e "${GREEN}✅ Vérification ESLint terminée !${NC}"
            echo -e "${YELLOW}💡 Pour corriger automatiquement: ./lint.sh --fix${NC}"
            ;;
    esac
}

# ===============================================
# 🎬 Point d'entrée
# ===============================================
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi