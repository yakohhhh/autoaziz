-- Migration 005: Nouvelle architecture normalisée
-- Création des tables customers, vehicles, et refactorisation appointments

-- ========================================
-- 1. Créer la table customers
-- ========================================
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL UNIQUE,
  address TEXT,
  city VARCHAR(255),
  "postalCode" VARCHAR(10),
  "emailVerified" BOOLEAN DEFAULT FALSE,
  "phoneVerified" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);

-- ========================================
-- 2. Créer la table vehicles
-- ========================================
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  registration VARCHAR(20) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  "fuelType" VARCHAR(50),
  year INTEGER,
  color VARCHAR(50),
  vin VARCHAR(17) UNIQUE,
  "firstRegistration" DATE,
  "customerId" INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vehicles_registration ON vehicles(registration);
CREATE INDEX idx_vehicles_customer ON vehicles("customerId");

-- ========================================
-- 3. Créer la table inspections
-- ========================================
CREATE TABLE IF NOT EXISTS inspections (
  id SERIAL PRIMARY KEY,
  result VARCHAR(50) NOT NULL,
  "defectsCount" INTEGER DEFAULT 0,
  "majorDefects" INTEGER DEFAULT 0,
  "minorDefects" INTEGER DEFAULT 0,
  kilometers INTEGER,
  "nextInspectionDue" DATE,
  "inspectorName" VARCHAR(255),
  "reportNumber" VARCHAR(100) UNIQUE,
  "reportPdfUrl" TEXT,
  notes TEXT,
  "appointmentId" INTEGER NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
  "vehicleId" INTEGER NOT NULL REFERENCES vehicles(id),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_inspections_result ON inspections(result);
CREATE INDEX idx_inspections_vehicle ON inspections("vehicleId");

-- ========================================
-- 4. Créer la table defects
-- ========================================
CREATE TABLE IF NOT EXISTS defects (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255),
  repaired BOOLEAN DEFAULT FALSE,
  "inspectionId" INTEGER NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_defects_inspection ON defects("inspectionId");
CREATE INDEX idx_defects_severity ON defects(severity);

-- ========================================
-- 5. Migrer les données existantes
-- ========================================

-- Créer les customers depuis appointments existants
INSERT INTO customers ("firstName", "lastName", email, phone, "emailVerified", "phoneVerified", "createdAt", "updatedAt")
SELECT DISTINCT 
  "firstName",
  "lastName",
  email,
  phone,
  COALESCE("emailVerified", false),
  COALESCE("phoneVerified", false),
  "createdAt",
  NOW()
FROM appointments
ON CONFLICT (email) DO NOTHING;

-- Créer les vehicles depuis appointments existants
INSERT INTO vehicles (registration, type, brand, model, "fuelType", "customerId", "createdAt", "updatedAt")
SELECT DISTINCT 
  a."vehicleRegistration",
  a."vehicleType",
  a."vehicleBrand",
  a."vehicleModel",
  a."fuelType",
  c.id,
  a."createdAt",
  NOW()
FROM appointments a
JOIN customers c ON c.email = a.email
ON CONFLICT (registration) DO NOTHING;

-- ========================================
-- 6. Créer nouvelle table appointments_new
-- ========================================
CREATE TABLE appointments_new (
  id SERIAL PRIMARY KEY,
  "appointmentDate" DATE NOT NULL,
  "appointmentTime" VARCHAR(10) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending_verification',
  price DECIMAL(10, 2),
  "verificationCode" VARCHAR(10),
  "verificationCodeExpiry" TIMESTAMP,
  notes TEXT,
  source VARCHAR(20) DEFAULT 'web',
  "customerId" INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  "vehicleId" INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_appointments_customer ON appointments_new("customerId");
CREATE INDEX idx_appointments_vehicle ON appointments_new("vehicleId");
CREATE INDEX idx_appointments_date ON appointments_new("appointmentDate");
CREATE INDEX idx_appointments_status ON appointments_new(status);

-- Migrer les appointments existants
INSERT INTO appointments_new (
  id,
  "appointmentDate",
  "appointmentTime",
  status,
  "verificationCode",
  "verificationCodeExpiry",
  notes,
  "customerId",
  "vehicleId",
  "createdAt",
  "updatedAt"
)
SELECT 
  a.id,
  a."appointmentDate",
  a."appointmentTime",
  a.status,
  a."verificationCode",
  a."verificationCodeExpiry",
  a.notes,
  c.id,
  v.id,
  a."createdAt",
  NOW()
FROM appointments a
JOIN customers c ON c.email = a.email
JOIN vehicles v ON v.registration = a."vehicleRegistration";

-- ========================================
-- 7. Remplacer l'ancienne table appointments
-- ========================================
DROP TABLE appointments;
ALTER TABLE appointments_new RENAME TO appointments;

-- Recréer la séquence
SELECT setval('appointments_id_seq', (SELECT MAX(id) FROM appointments));

-- ========================================
-- 8. Mettre à jour la table contacts
-- ========================================
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'new';
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);

-- ========================================
-- 9. Calculer les prix des rendez-vous existants
-- ========================================
UPDATE appointments a
SET price = CASE 
  WHEN v.type = 'Voiture' THEN 70
  WHEN v.type = 'Moto' THEN 60
  WHEN v.type = 'Utilitaire' THEN 80
  WHEN v.type = '4x4' THEN 75
  WHEN v.type = 'Camping-car' THEN 90
  WHEN v.type = 'Collection' THEN 80
  ELSE 70
END
FROM vehicles v
WHERE a."vehicleId" = v.id
AND a.price IS NULL;

-- ========================================
-- Fin de la migration
-- ========================================
