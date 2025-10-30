-- Migration 009: Add sync columns to TypeORM appointments table
-- Purpose: Ensure TypeORM and Prisma databases stay synchronized
-- Date: 2025-01-XX

-- Add missing columns to appointments table for soft deletes and status tracking
ALTER TABLE appointments 
  ADD COLUMN IF NOT EXISTS "actualStatus" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "deletionReason" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "deletionNote" TEXT;

-- Add indexes for query performance
CREATE INDEX IF NOT EXISTS idx_appointments_deleted_at ON appointments("deletedAt");
CREATE INDEX IF NOT EXISTS idx_appointments_actual_status ON appointments("actualStatus");

-- Add comments for documentation
COMMENT ON COLUMN appointments."actualStatus" IS 'Real outcome status (venu, absent, annulé)';
COMMENT ON COLUMN appointments."deletedAt" IS 'Soft delete timestamp - appointment hidden when not null';
COMMENT ON COLUMN appointments."deletionReason" IS 'Reason for deletion (required when deleting)';
COMMENT ON COLUMN appointments."deletionNote" IS 'Optional note explaining deletion';

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'appointments' 
  AND column_name IN ('actualStatus', 'deletedAt', 'deletionReason', 'deletionNote')
ORDER BY column_name;
