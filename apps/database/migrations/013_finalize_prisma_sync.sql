-- Migration 013: Finaliser la synchronisation avec Prisma
-- Date: 2025-10-30
-- Description: Retirer vehicleYear et ajouter les index manquants

BEGIN;

-- 1. Supprimer la colonne vehicleYear qui n'existe pas dans Prisma
ALTER TABLE appointments DROP COLUMN IF EXISTS "vehicleYear";

-- 2. Ajouter les index manquants pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS "appointments_email_idx" ON appointments(email);
CREATE INDEX IF NOT EXISTS "appointments_appointmentDate_idx" ON appointments("appointmentDate");
CREATE INDEX IF NOT EXISTS "appointments_status_idx" ON appointments(status);

-- 3. S'assurer que updatedAt se met à jour automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
CREATE TRIGGER update_vehicles_updated_at 
    BEFORE UPDATE ON vehicles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- Vérification
\d appointments
