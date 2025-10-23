#!/bin/bash

# Script de test rapide pour le système d'authentification
# Usage: ./test-auth-system.sh

echo "🔍 Test du système d'authentification AUTOSUR"
echo "=============================================="
echo ""

# Vérifier si le backend est lancé
echo "📡 Vérification du backend..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend accessible sur http://localhost:3001"
else
    echo "❌ Backend non accessible. Lancez-le avec: cd apps/backend && npm run start:dev"
    exit 1
fi

# Vérifier si le frontend est lancé
echo ""
echo "🌐 Vérification du frontend..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend accessible sur http://localhost:3000"
else
    echo "❌ Frontend non accessible. Lancez-le avec: cd apps/frontend && npm start"
    exit 1
fi

# Test de l'endpoint de login
echo ""
echo "🔐 Test de l'endpoint de login..."
RESPONSE=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@autosur.com","password":"admin123"}')

if echo $RESPONSE | grep -q "token"; then
    echo "✅ Login endpoint fonctionne"
    echo "   Response: $RESPONSE"
else
    echo "❌ Login endpoint ne fonctionne pas"
    echo "   Response: $RESPONSE"
fi

# Test de l'endpoint stats
echo ""
echo "📊 Test de l'endpoint stats..."
STATS=$(curl -s http://localhost:3001/admin/stats?range=month)

if echo $STATS | grep -q "totalAppointments"; then
    echo "✅ Stats endpoint fonctionne"
    echo "   Response: $STATS"
else
    echo "❌ Stats endpoint ne fonctionne pas"
    echo "   Response: $STATS"
fi

echo ""
echo "=============================================="
echo "✨ Tests terminés !"
echo ""
echo "📝 Prochaines étapes:"
echo "   1. Ouvrir http://localhost:3000/login"
echo "   2. Se connecter avec:"
echo "      Email: admin@autosur.com"
echo "      Password: admin123"
echo "   3. Accéder au dashboard admin"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: QUICK_START_LOGIN.md"
echo "   - Guide complet: docs/ADMIN_AUTH_GUIDE.md"
echo "   - Résumé: docs/LOGIN_DASHBOARD_SUMMARY.md"
echo ""
