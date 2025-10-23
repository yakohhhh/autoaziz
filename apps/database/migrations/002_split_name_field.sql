-- Migration pour séparer le champ 'name' en 'firstName' et 'lastName'
-- et mettre à jour le format du numéro de téléphone

-- Étape 1: Ajouter les nouvelles colonnes
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS "firstName" VARCHAR(255);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS "lastName" VARCHAR(255);

-- Étape 2: Migrer les données existantes
-- Tente de diviser le nom existant (premier mot = prénom, reste = nom)
UPDATE appointments 
SET 
  "firstName" = SPLIT_PART(name, ' ', 1),
  "lastName" = CASE 
    WHEN POSITION(' ' IN name) > 0 THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
    ELSE ''
  END
WHERE "firstName" IS NULL OR "lastName" IS NULL;

-- Étape 3: Supprimer l'ancienne colonne 'name'
ALTER TABLE appointments DROP COLUMN IF EXISTS name;

-- Étape 4: Rendre les nouvelles colonnes obligatoires
ALTER TABLE appointments ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE appointments ALTER COLUMN "lastName" SET NOT NULL;

-- Étape 5: Mettre à jour les numéros de téléphone au format international si nécessaire
-- Convertir les numéros français au format +33
UPDATE appointments 
SET phone = '+33' || SUBSTRING(phone FROM 2)
WHERE phone LIKE '06%' OR phone LIKE '07%';

UPDATE appointments 
SET phone = '+33' || SUBSTRING(phone FROM 2)
WHERE phone LIKE '01%' OR phone LIKE '02%' OR phone LIKE '03%' OR phone LIKE '04%' OR phone LIKE '05%' OR phone LIKE '08%' OR phone LIKE '09%';

-- Nettoyer les espaces dans les numéros de téléphone
UPDATE appointments 
SET phone = REPLACE(phone, ' ', '');

-- Note: Cette migration suppose que tous les numéros existants sont français
-- Si vous avez des numéros internationaux, ajustez en conséquence
