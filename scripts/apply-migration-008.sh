#!/bin/bash
# Script pour appliquer la migration 008
# Synchronise actualStatus avec status

set -e

echo "🔄 Application de la migration 008: Synchronisation actualStatus..."

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier si Docker est en cours d'exécution
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker n'est pas en cours d'exécution${NC}"
    exit 1
fi

# Variables de connexion
DB_CONTAINER="autoaziz-postgres-1"
DB_NAME="autoaziz"
DB_USER="autoaziz_user"

echo -e "${YELLOW}📊 État avant migration:${NC}"
docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME << 'EOF'
SELECT 
  status,
  "actualStatus",
  COUNT(*) as count
FROM appointments
WHERE "deletedAt" IS NULL
GROUP BY status, "actualStatus"
ORDER BY status, "actualStatus";
EOF

echo ""
echo -e "${YELLOW}🔄 Application de la migration...${NC}"

# Appliquer la migration
docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME < apps/database/migrations/008_sync_actual_status.sql

echo ""
echo -e "${GREEN}✅ Migration 008 appliquée avec succès!${NC}"
echo ""
echo -e "${YELLOW}📊 État après migration:${NC}"
docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME << 'EOF'
SELECT 
  status,
  "actualStatus",
  COUNT(*) as count
FROM appointments
WHERE "deletedAt" IS NULL
GROUP BY status, "actualStatus"
ORDER BY status, "actualStatus";
EOF

echo ""
echo -e "${GREEN}🎉 Terminé! Les statistiques des clients vont maintenant refléter l'actualStatus.${NC}"
