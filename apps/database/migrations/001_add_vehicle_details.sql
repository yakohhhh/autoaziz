-- Migration pour ajouter les nouveaux champs véhicule
-- Date: 2025-10-16
-- Description: Ajout des champs marque, modèle, année, carburant et notes

-- Étape 1: Ajouter les nouvelles colonnes (temporairement nullables)
ALTER TABLE appointments
ADD COLUMN vehicle_brand VARCHAR(100),
ADD COLUMN vehicle_model VARCHAR(100),
ADD COLUMN vehicle_year INTEGER,
ADD COLUMN fuel_type VARCHAR(50),
ADD COLUMN notes TEXT;

-- Étape 2: Mettre à jour les enregistrements existants avec des valeurs par défaut
UPDATE appointments
SET vehicle_brand = 'Non spécifié',
    vehicle_model = 'Non spécifié',
    vehicle_year = 2020,
    fuel_type = 'Essence'
WHERE vehicle_brand IS NULL;

-- Étape 3: Rendre les colonnes obligatoires (sauf notes et fuel_type)
ALTER TABLE appointments
ALTER COLUMN vehicle_brand SET NOT NULL,
ALTER COLUMN vehicle_model SET NOT NULL,
ALTER COLUMN vehicle_year SET NOT NULL;

-- Vérification
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;
