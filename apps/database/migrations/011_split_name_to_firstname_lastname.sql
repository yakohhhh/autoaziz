-- Migration 011: Diviser la colonne 'name' en 'firstName' et 'lastName'
-- Date: 2025-10-30
-- Description: Mise à jour du schéma pour correspondre au modèle Prisma

BEGIN;

-- 1. Ajouter les nouvelles colonnes firstName et lastName
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS "firstName" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "lastName" VARCHAR(255);

-- 2. Migrer les données existantes (diviser name en firstName/lastName)
UPDATE appointments
SET 
  "firstName" = CASE 
    WHEN POSITION(' ' IN name) > 0 THEN SUBSTRING(name FROM 1 FOR POSITION(' ' IN name) - 1)
    ELSE name
  END,
  "lastName" = CASE 
    WHEN POSITION(' ' IN name) > 0 THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
    ELSE 'N/A'
  END
WHERE "firstName" IS NULL;

-- 3. Faire les colonnes NOT NULL maintenant qu'elles sont remplies
ALTER TABLE appointments
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL;

-- 4. Supprimer l'ancienne colonne name
ALTER TABLE appointments
DROP COLUMN IF EXISTS name;

-- 5. Faire la même chose pour la table customers si elle a encore 'name'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'name'
  ) THEN
    -- Ajouter firstName et lastName si elles n'existent pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'firstName') THEN
      ALTER TABLE customers ADD COLUMN "firstName" VARCHAR(255);
      ALTER TABLE customers ADD COLUMN "lastName" VARCHAR(255);
      
      -- Migrer les données
      UPDATE customers
      SET 
        "firstName" = CASE 
          WHEN POSITION(' ' IN name) > 0 THEN SUBSTRING(name FROM 1 FOR POSITION(' ' IN name) - 1)
          ELSE name
        END,
        "lastName" = CASE 
          WHEN POSITION(' ' IN name) > 0 THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
          ELSE 'N/A'
        END;
      
      -- Faire NOT NULL
      ALTER TABLE customers
      ALTER COLUMN "firstName" SET NOT NULL,
      ALTER COLUMN "lastName" SET NOT NULL;
      
      -- Supprimer name
      ALTER TABLE customers DROP COLUMN name;
    END IF;
  END IF;
END $$;

COMMIT;

-- Vérification
SELECT 
  'appointments' as table_name,
  COUNT(*) as total_rows,
  COUNT("firstName") as rows_with_firstname,
  COUNT("lastName") as rows_with_lastname
FROM appointments
UNION ALL
SELECT 
  'customers' as table_name,
  COUNT(*) as total_rows,
  COUNT("firstName") as rows_with_firstname,
  COUNT("lastName") as rows_with_lastname
FROM customers;
