#!/bin/bash
cd /home/depop/delivery/part-time/autoaziz/apps/frontend
echo "⚛️ Lancement du frontend depuis $(pwd)"
echo "📦 Vérification du package.json..."
ls -la package.json
echo "🚀 Lancement de React..."
npm start