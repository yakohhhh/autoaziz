-- Migration 007: Ajout du système de suivi des suppressions
-- Date: 2025-10-24

-- Table pour tracker les suppressions de RDV
CREATE TABLE IF NOT EXISTS appointment_deletions (
  id SERIAL PRIMARY KEY,
  "appointmentId" INTEGER NOT NULL,
  "customerId" INTEGER,
  "customerName" VARCHAR(255),
  "appointmentDate" DATE,
  "appointmentTime" VARCHAR(10),
  "deletionReason" VARCHAR(50) NOT NULL,
  "deletionNote" TEXT,
  "deletedBy" VARCHAR(255),
  "deletedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_deletion_reason ON appointment_deletions("deletionReason");
CREATE INDEX idx_deletion_date ON appointment_deletions("deletedAt");

-- Table pour tracker les suppressions de clients
CREATE TABLE IF NOT EXISTS customer_deletions (
  id SERIAL PRIMARY KEY,
  "customerId" INTEGER NOT NULL,
  "customerName" VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(255),
  "deletionReason" VARCHAR(50) NOT NULL,
  "deletionNote" TEXT,
  "appointmentsCount" INTEGER DEFAULT 0,
  "deletedBy" VARCHAR(255),
  "deletedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customer_deletion_date ON customer_deletions("deletedAt");

-- Ajouter un champ pour marquer les RDV comme supprimés (soft delete)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS "deletionReason" VARCHAR(50);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS "deletionNote" TEXT;

CREATE INDEX IF NOT EXISTS idx_appointments_deleted ON appointments("deletedAt");

-- Mettre à jour la contrainte status pour inclure 'deleted'
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS chk_status_valid;
