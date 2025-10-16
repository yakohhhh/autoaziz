#!/bin/bash

# Script de migration de la base de données
# Exécute les migrations SQL pour Auto Aziz

set -e

echo "🔄 Migration de la base de données Auto Aziz"
echo "=============================================="

# Vérifier si le conteneur PostgreSQL est en cours d'exécution
if ! docker ps | grep -q autoaziz-postgres-dev; then
    echo "❌ Le conteneur PostgreSQL n'est pas en cours d'exécution."
    echo "   Démarrez-le avec: cd infrastructure && docker-compose up -d postgres"
    exit 1
fi

echo "✅ Conteneur PostgreSQL détecté"

# Définir les variables
CONTAINER_NAME="autoaziz-postgres-dev"
DB_NAME="autoaziz"
DB_USER="postgres"
MIGRATION_FILE="/tmp/migration.sql"

# Copier le fichier de migration dans le conteneur
echo "📦 Copie du fichier de migration..."
docker cp ../apps/database/migrations/001_add_vehicle_details.sql ${CONTAINER_NAME}:${MIGRATION_FILE}

# Exécuter la migration
echo "⚙️  Exécution de la migration..."
docker exec -it ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -f ${MIGRATION_FILE}

if [ $? -eq 0 ]; then
    echo "✅ Migration exécutée avec succès!"
    echo ""
    echo "📊 Vérification des nouvelles colonnes:"
    docker exec -it ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -c "\d+ appointments"
else
    echo "❌ Erreur lors de l'exécution de la migration"
    exit 1
fi

echo ""
echo "🎉 Migration terminée!"
echo "=============================================="
