-- Migration pour supprimer la colonne vehicleYear

ALTER TABLE appointments DROP COLUMN IF EXISTS "vehicleYear";

-- Afficher le résultat
SELECT id, "firstName", "lastName", "vehicleBrand", "vehicleModel", phone 
FROM appointments 
LIMIT 5;
