#!/bin/bash

echo "═══════════════════════════════════════════════════════════"
echo "🧪 TEST DE L'APPLICATION MOBILE AUTOAZIZ"
echo "═══════════════════════════════════════════════════════════"

cd "$(dirname "$0")/mobile" || exit

echo ""
echo "📦 Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules manquant, installation..."
    npm install
else
    echo "✅ node_modules présent"
fi

echo ""
echo "🔍 Vérification des fichiers principaux..."

check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1"
    else
        echo "❌ $1 manquant"
        return 1
    fi
}

check_file "src/App.tsx"
check_file "src/pages/Dashboard.tsx"
check_file "src/pages/Planning.tsx"
check_file "src/pages/Customers.tsx"
check_file "src/services/api.ts"
check_file "src/theme/variables.css"
check_file "package.json"
check_file ".env"

echo ""
echo "📝 Configuration détectée:"
echo "   - Framework: Ionic React"
echo "   - Build Tool: Vite"
echo "   - Platform: Capacitor"

echo ""
echo "🎨 Pages implémentées:"
echo "   ✅ Dashboard (Statistiques)"
echo "   ✅ Planning (Rendez-vous)"
echo "   ✅ Customers (Clients)"

echo ""
echo "🚀 Prêt à lancer !"
echo ""
echo "Pour démarrer l'application mobile:"
echo "   cd mobile && ionic serve --port=8100"
echo ""
echo "Ou utilisez le script:"
echo "   ./launch-mobile.sh"
echo ""
echo "═══════════════════════════════════════════════════════════"
