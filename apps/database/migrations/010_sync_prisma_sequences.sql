-- Migration 010: Sync Prisma sequence with TypeORM IDs
-- Purpose: Ensure Prisma ID sequence doesn't conflict with TypeORM IDs
-- Date: 2025-01-XX

-- Get the max ID from appointments table (includes both TypeORM and Prisma created records)
DO $$
DECLARE
  max_id INTEGER;
BEGIN
  SELECT COALESCE(MAX(id), 0) + 1 INTO max_id FROM appointments;
  
  -- Reset the sequence to start after the highest ID
  EXECUTE format('ALTER SEQUENCE appointments_id_seq RESTART WITH %s', max_id);
  
  RAISE NOTICE 'Appointments ID sequence reset to start at %', max_id;
END $$;

-- Do the same for customers and vehicles to be safe
DO $$
DECLARE
  max_id INTEGER;
BEGIN
  SELECT COALESCE(MAX(id), 0) + 1 INTO max_id FROM customers;
  EXECUTE format('ALTER SEQUENCE customers_id_seq RESTART WITH %s', max_id);
  RAISE NOTICE 'Customers ID sequence reset to start at %', max_id;
END $$;

DO $$
DECLARE
  max_id INTEGER;
BEGIN
  SELECT COALESCE(MAX(id), 0) + 1 INTO max_id FROM vehicles;
  EXECUTE format('ALTER SEQUENCE vehicles_id_seq RESTART WITH %s', max_id);
  RAISE NOTICE 'Vehicles ID sequence reset to start at %', max_id;
END $$;

-- Verify sequences
SELECT 
  'appointments' as table_name,
  last_value as current_sequence_value,
  (SELECT MAX(id) FROM appointments) as max_id_in_table
FROM appointments_id_seq
UNION ALL
SELECT 
  'customers',
  last_value,
  (SELECT MAX(id) FROM customers)
FROM customers_id_seq
UNION ALL
SELECT 
  'vehicles',
  last_value,
  (SELECT MAX(id) FROM vehicles)
FROM vehicles_id_seq;
