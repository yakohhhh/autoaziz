# 🚀 Quick Start: Deploy Database Sync Fix

## EMERGENCY FIX - Database Synchronization

**Problem:** Customers not appearing, deleted appointments still blocking slots

**Status:** ✅ Code fixed, ready to deploy

---

## Deploy in 1 Command

```bash
cd /home/depop/delivery/part-time/autoaziz
./scripts/fix-database-sync.sh
```

This will:
1. Add missing columns to database ✅
2. Sync ID sequences ✅
3. Rebuild backend ✅
4. Restart services ✅

**Time:** ~2-3 minutes

---

## Test After Deployment

### ✅ Test 1: Create Appointment (Public Form)
- Customer should appear in Admin > Clients immediately

### ✅ Test 2: Delete Appointment (Admin Planning)
- Slot should become available for booking again

### ✅ Test 3: Check Logs
```bash
docker-compose -f infrastructure/docker-compose.yml logs -f backend | grep "✅"
```

Look for:
- `✅ TypeORM: Appointment X marked as deleted`
- `✅ RDV #X synchronisé dans Prisma`

---

## What Was Fixed

### Backend Files Modified:
1. **appointment.entity.ts** - Added deletedAt, actualStatus columns
2. **slots.service.ts** - Filter deleted appointments
3. **calendar.service.ts** - Sync BOTH databases on delete/update
4. **admin.module.ts** - Inject TypeORM repository

### Database Migrations:
1. **009_add_typeorm_sync_columns.sql** - Add missing columns
2. **010_sync_prisma_sequences.sql** - Prevent ID conflicts

---

## If Something Goes Wrong

### Rollback Database Changes
```bash
docker-compose -f infrastructure/docker-compose.yml exec postgres psql -U autoaziz -d autoaziz

-- Remove columns (if needed)
ALTER TABLE appointments DROP COLUMN IF EXISTS "deletedAt";
ALTER TABLE appointments DROP COLUMN IF EXISTS "actualStatus";
ALTER TABLE appointments DROP COLUMN IF EXISTS "deletionReason";
ALTER TABLE appointments DROP COLUMN IF EXISTS "deletionNote";
```

### Rebuild Backend
```bash
docker-compose -f infrastructure/docker-compose.yml build backend
docker-compose -f infrastructure/docker-compose.yml restart backend
```

### Check Logs
```bash
docker-compose -f infrastructure/docker-compose.yml logs backend --tail=100
```

---

## Full Documentation

See: `docs/DATABASE_SYNC_FIX.md` for complete technical details

---

**Ready to deploy? Run:** `./scripts/fix-database-sync.sh`
