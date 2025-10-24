-- Ajout des tables Customer et Vehicle

-- Table customers
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(255) NOT NULL,
  notes TEXT,
  "totalVisits" INTEGER DEFAULT 0,
  "totalCancellations" INTEGER DEFAULT 0,
  "totalNoShows" INTEGER DEFAULT 0,
  "totalSpent" DOUBLE PRECISION DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- Table vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  "customerId" INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  "licensePlate" VARCHAR(255) NOT NULL,
  "vehicleType" VARCHAR(255) NOT NULL,
  "vehicleBrand" VARCHAR(255) NOT NULL,
  "vehicleModel" VARCHAR(255) NOT NULL,
  "fuelType" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("customerId", "licensePlate")
);

CREATE INDEX IF NOT EXISTS idx_vehicles_license ON vehicles("licensePlate");

-- Ajout des colonnes dans appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS "customerId" INTEGER REFERENCES customers(id) ON DELETE SET NULL;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS "vehicleId" INTEGER REFERENCES vehicles(id) ON DELETE SET NULL;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS price DOUBLE PRECISION;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS "actualStatus" VARCHAR(255);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS source VARCHAR(255);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_appointments_customer ON appointments("customerId");
CREATE INDEX IF NOT EXISTS idx_appointments_vehicle ON appointments("vehicleId");

-- Fonction trigger pour mettre à jour updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updatedAt
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
