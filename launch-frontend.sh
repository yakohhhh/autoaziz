#!/bin/bash

echo "═══════════════════════════════════════════════════════════"
echo "🌐 LANCEMENT DU FRONTEND AUTOSUR"
echo "═══════════════════════════════════════════════════════════"

cd /home/depop/delivery/part-time/autoaziz/apps/frontend

echo ""
echo "📦 Répertoire: $(pwd)"
echo "� Vérification du package.json..."

if [ ! -f package.json ]; then
    echo "❌ package.json introuvable"
    exit 1
fi

echo "✅ package.json trouvé"

# Vérifier si node_modules existe
if [ ! -d node_modules ]; then
    echo ""
    echo "⚠️  node_modules manquant"
    echo "� Installation des dépendances..."
    npm install
fi

# Vérifier si le fichier .env existe
if [ ! -f .env ]; then
    echo ""
    echo "📝 Création du fichier .env..."
    cat > .env << 'EOF'
REACT_APP_API_URL=http://localhost:3001
REACT_APP_NAME=AUTOSUR
EOF
    echo "✅ Fichier .env créé"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🚀 Démarrage de React..."
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🌐 L'application sera disponible sur: http://localhost:3000"
echo "🔐 Page de login: http://localhost:3000/login"
echo ""

npm start