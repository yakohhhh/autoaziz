#!/bin/bash

echo "═══════════════════════════════════════════════════════════"
echo "📱 LANCEMENT DE L'APPLICATION MOBILE AUTOAZIZ"
echo "═══════════════════════════════════════════════════════════"

# Aller dans le dossier mobile
cd "$(dirname "$0")/mobile" || exit

# Vérifier si le dossier node_modules existe
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installation des dépendances..."
    npm install
fi

# Vérifier si le backend est en cours d'exécution
echo ""
echo "🔍 Vérification du backend..."
if pgrep -f "nest start" > /dev/null; then
    echo "✅ Backend en cours d'exécution"
else
    echo "⚠️  Le backend n'est pas en cours d'exécution"
    echo "💡 Lancez-le avec: ./launch-backend.sh"
fi

# Lancer l'application mobile
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🚀 Lancement de l'application mobile..."
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📱 L'application sera accessible sur:"
echo "   http://localhost:8100"
echo ""
echo "💡 Pour tester sur votre téléphone:"
echo "   1. Assurez-vous d'être sur le même réseau WiFi"
echo "   2. Trouvez votre adresse IP: ip addr show"
echo "   3. Accédez à http://VOTRE_IP:8100"
echo ""
echo "🔧 Pour build l'app native:"
echo "   Android: ionic capacitor add android && ionic capacitor open android"
echo "   iOS: ionic capacitor add ios && ionic capacitor open ios"
echo ""

# Lancer Ionic serve
ionic serve --port=8100
