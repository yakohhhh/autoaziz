-- Migration 012: Créer les tables customers et vehicles
-- Date: 2025-10-30
-- Description: Création des tables manquantes pour le système Prisma

BEGIN;

-- Créer la table customers
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(255) NOT NULL,
  notes TEXT,
  "totalVisits" INTEGER DEFAULT 0 NOT NULL,
  "totalCancellations" INTEGER DEFAULT 0 NOT NULL,
  "totalNoShows" INTEGER DEFAULT 0 NOT NULL,
  "totalSpent" DOUBLE PRECISION DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  "customerId" INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  "licensePlate" VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  "fuelType" VARCHAR(255),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("customerId", "licensePlate")
);

-- Créer les index
CREATE INDEX IF NOT EXISTS "vehicles_licensePlate_idx" ON vehicles("licensePlate");
CREATE INDEX IF NOT EXISTS "appointments_customerId_idx" ON appointments("customerId");
CREATE INDEX IF NOT EXISTS "appointments_vehicleId_idx" ON appointments("vehicleId");

-- Ajouter les contraintes de clés étrangères sur appointments si elles n'existent pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'appointments_customerId_fkey'
  ) THEN
    ALTER TABLE appointments 
    ADD CONSTRAINT "appointments_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES customers(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'appointments_vehicleId_fkey'
  ) THEN
    ALTER TABLE appointments 
    ADD CONSTRAINT "appointments_vehicleId_fkey" 
    FOREIGN KEY ("vehicleId") REFERENCES vehicles(id) ON DELETE SET NULL;
  END IF;
END $$;

COMMIT;

-- Vérification
SELECT 
  tablename,
  schemaname
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
