#!/bin/bash

# Emergency fix for TypeORM ↔ Prisma sync issues
# Applies migrations 009 and 010, then restarts backend

set -e

echo "🚨 EMERGENCY FIX: Synchronizing TypeORM and Prisma databases"
echo "=============================================================="
echo ""

# Step 1: Apply migration 009 (add columns)
echo "📋 Step 1/5: Adding missing columns to TypeORM..."
if [ -f "apps/database/migrations/009_add_typeorm_sync_columns.sql" ]; then
    docker-compose -f infrastructure/docker-compose.yml exec -T postgres \
        psql -U autoaziz -d autoaziz < apps/database/migrations/009_add_typeorm_sync_columns.sql
    echo "✅ Migration 009 applied"
else
    echo "⚠️ Migration 009 not found, skipping..."
fi
echo ""

# Step 2: Apply migration 010 (sync sequences)
echo "📋 Step 2/5: Syncing ID sequences..."
if [ -f "apps/database/migrations/010_sync_prisma_sequences.sql" ]; then
    docker-compose -f infrastructure/docker-compose.yml exec -T postgres \
        psql -U autoaziz -d autoaziz < apps/database/migrations/010_sync_prisma_sequences.sql
    echo "✅ Migration 010 applied"
else
    echo "⚠️ Migration 010 not found, skipping..."
fi
echo ""

# Step 3: Rebuild backend (to include new TypeORM entity fields)
echo "📋 Step 3/5: Rebuilding backend..."
docker-compose -f infrastructure/docker-compose.yml build backend
echo "✅ Backend rebuilt"
echo ""

# Step 4: Restart backend
echo "📋 Step 4/5: Restarting backend..."
docker-compose -f infrastructure/docker-compose.yml restart backend
echo "✅ Backend restarted"
echo ""

# Step 5: Wait for backend to be ready
echo "📋 Step 5/5: Waiting for backend to be ready..."
sleep 5
echo "✅ Backend should be ready"
echo ""

echo "🎉 EMERGENCY FIX COMPLETED!"
echo "=========================="
echo ""
echo "🔍 TESTING CHECKLIST:"
echo "  1. Create a test appointment via public form"
echo "     → Customer should appear in admin panel immediately"
echo "  2. Delete the appointment in admin planning"
echo "     → Slot should become available for booking again"
echo "  3. Check backend logs for sync confirmations:"
echo "     docker-compose -f infrastructure/docker-compose.yml logs -f backend | grep -E '✅|❌'"
echo ""
echo "📊 Verify database sync:"
echo "  docker-compose -f infrastructure/docker-compose.yml exec postgres psql -U autoaziz -d autoaziz -c \"SELECT id, email, status, 'deletedAt', 'actualStatus' FROM appointments ORDER BY id DESC LIMIT 5;\""
echo ""
