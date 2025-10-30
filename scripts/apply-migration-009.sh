#!/bin/bash

# Apply migration 009: Add TypeORM sync columns
# This migration adds the missing columns to ensure bidirectional sync between TypeORM and Prisma

set -e

MIGRATION_FILE="apps/database/migrations/009_add_typeorm_sync_columns.sql"

echo "🔄 Applying Migration 009: Add TypeORM sync columns..."

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

# Apply migration using docker-compose
docker-compose -f infrastructure/docker-compose.yml exec -T postgres psql -U autoaziz -d autoaziz < "$MIGRATION_FILE"

echo "✅ Migration 009 applied successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Restart the backend: docker-compose -f infrastructure/docker-compose.yml restart backend"
echo "  2. Test appointment creation (verify customer appears)"
echo "  3. Test appointment deletion (verify slot becomes available)"
echo "  4. Check backend logs for sync confirmation messages"
