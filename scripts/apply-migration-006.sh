#!/bin/bash

# Script pour appliquer la migration 006
# Corrige la contrainte source dans la table appointments

echo "🔄 Application de la migration 006_fix_source_constraint.sql..."

# Chemin vers le fichier de migration
MIGRATION_FILE="$(dirname "$0")/../apps/database/migrations/006_fix_source_constraint.sql"

# Variables de connexion (à adapter selon votre configuration)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-autoaziz}"
DB_USER="${DB_USER:-autoaziz}"

# Vérifier si on utilise Docker ou une connexion directe
if docker ps | grep -q postgres; then
    echo "📦 Utilisation de Docker..."
    CONTAINER_NAME=$(docker ps --format '{{.Names}}' | grep postgres | head -1)
    docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$MIGRATION_FILE"
else
    echo "🔌 Connexion directe à PostgreSQL..."
    PGPASSWORD="${DB_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE"
fi

if [ $? -eq 0 ]; then
    echo "✅ Migration appliquée avec succès !"
else
    echo "❌ Erreur lors de l'application de la migration"
    exit 1
fi
