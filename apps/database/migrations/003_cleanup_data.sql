-- Script pour nettoyer les données après migration

-- Mettre un nom par défaut si lastName est vide
UPDATE appointments 
SET "lastName" = 'Client'
WHERE "lastName" IS NULL OR "lastName" = '';

-- Afficher le résultat
SELECT id, "firstName", "lastName", phone FROM appointments;
