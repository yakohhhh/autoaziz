#!/bin/bash
cd /home/depop/delivery/part-time/autoaziz/apps/backend
echo "🚀 Lancement du backend depuis $(pwd)"
echo "📦 Vérification du package.json..."
ls -la package.json
echo "🔥 Lancement de NestJS..."
npm run start:dev