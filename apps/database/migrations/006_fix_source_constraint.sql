-- Migration 006: Corriger la contrainte source pour accepter toutes les valeurs
-- Date: 2025-10-24

-- Supprimer l'ancienne contrainte si elle existe
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS chk_source_valid;

-- Créer une nouvelle contrainte plus flexible
ALTER TABLE appointments ADD CONSTRAINT chk_source_valid 
  CHECK (source IN ('online', 'phone', 'manual', 'web', 'walk-in', 'admin'));

-- Mettre à jour les valeurs existantes
UPDATE appointments SET source = 'online' WHERE source = 'web';
UPDATE appointments SET source = 'manual' WHERE source IN ('center', 'walk-in', 'admin');

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_appointments_source ON appointments(source);
