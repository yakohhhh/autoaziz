#!/bin/bash

echo "═══════════════════════════════════════════════════════════"
echo "🚀 AUTOAZIZ - LANCEMENT COMPLET (WEB + MOBILE)"
echo "═══════════════════════════════════════════════════════════"

# Fonction pour vérifier si un port est utilisé
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Vérifier PostgreSQL
echo ""
echo "🔍 Vérification de PostgreSQL..."
PG_STATUS=$(sudo systemctl is-active postgresql)

if [ "$PG_STATUS" != "active" ]; then
    echo "⚡ Démarrage de PostgreSQL..."
    sudo systemctl start postgresql
    sleep 2
fi
echo "✅ PostgreSQL actif"

# Lancer le backend si pas déjà en cours
echo ""
echo "🔧 Backend (Port 3001)..."
if check_port 3001; then
    echo "✅ Backend déjà en cours d'exécution"
else
    echo "⚡ Démarrage du backend..."
    cd apps/backend
    npm run start:dev > /tmp/autoaziz-backend.log 2>&1 &
    cd ../..
    sleep 3
    echo "✅ Backend démarré"
fi

# Lancer le frontend si pas déjà en cours
echo ""
echo "🎨 Frontend Web (Port 3000)..."
if check_port 3000; then
    echo "✅ Frontend déjà en cours d'exécution"
else
    echo "⚡ Démarrage du frontend web..."
    cd apps/frontend
    npm start > /tmp/autoaziz-frontend.log 2>&1 &
    cd ../..
    sleep 3
    echo "✅ Frontend démarré"
fi

# Lancer l'app mobile si pas déjà en cours
echo ""
echo "📱 Application Mobile (Port 8100)..."
if check_port 8100; then
    echo "✅ App mobile déjà en cours d'exécution"
else
    echo "⚡ Démarrage de l'application mobile..."
    cd mobile
    ionic serve --port=8100 > /tmp/autoaziz-mobile.log 2>&1 &
    cd ..
    sleep 3
    echo "✅ App mobile démarrée"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ TOUS LES SERVICES SONT EN COURS D'EXÉCUTION !"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🌐 Accès aux applications :"
echo ""
echo "   📱 Application Mobile (Patron)"
echo "   ➜  http://localhost:8100"
echo "      - Tableau de bord avec statistiques"
echo "      - Planning et gestion RDV"
echo "      - Liste des clients"
echo ""
echo "   🎨 Interface Web (Public + Admin)"
echo "   ➜  http://localhost:3000"
echo "      - Page d'accueil publique"
echo "      - Prise de rendez-vous"
echo "      - Admin: http://localhost:3000/login"
echo "        Email: admin@autosur.com"
echo "        Password: admin123"
echo ""
echo "   🔧 API Backend"
echo "   ➜  http://localhost:3001"
echo "      - Swagger: http://localhost:3001/api"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📊 Logs en temps réel :"
echo "   Backend:  tail -f /tmp/autoaziz-backend.log"
echo "   Frontend: tail -f /tmp/autoaziz-frontend.log"
echo "   Mobile:   tail -f /tmp/autoaziz-mobile.log"
echo ""
echo "🛑 Pour arrêter tous les services :"
echo "   ./scripts/stop-all.sh"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎉 Bonne utilisation d'AutoAziz !"
echo "═══════════════════════════════════════════════════════════"
