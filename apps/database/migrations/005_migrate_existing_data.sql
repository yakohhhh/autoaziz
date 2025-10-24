-- Script de migration des rendez-vous existants vers le système Customer/Vehicle

-- 1. Créer les clients à partir des rendez-vous existants (en évitant les doublons)
INSERT INTO customers ("firstName", "lastName", email, phone, "createdAt", "updatedAt")
SELECT DISTINCT ON (email)
  "firstName",
  "lastName",
  email,
  phone,
  MIN("createdAt") as "createdAt",
  NOW() as "updatedAt"
FROM appointments
WHERE email IS NOT NULL AND email != ''
GROUP BY "firstName", "lastName", email, phone
ON CONFLICT (email) DO NOTHING;

-- 2. Créer les véhicules pour chaque client
INSERT INTO vehicles ("customerId", "licensePlate", "vehicleType", "vehicleBrand", "vehicleModel", "fuelType", "createdAt", "updatedAt")
SELECT DISTINCT ON (c.id, a."vehicleRegistration")
  c.id as "customerId",
  a."vehicleRegistration" as "licensePlate",
  a."vehicleType",
  a."vehicleBrand",
  a."vehicleModel",
  a."fuelType",
  MIN(a."createdAt") as "createdAt",
  NOW() as "updatedAt"
FROM appointments a
INNER JOIN customers c ON c.email = a.email
WHERE a."vehicleRegistration" IS NOT NULL AND a."vehicleRegistration" != ''
GROUP BY c.id, a."vehicleRegistration", a."vehicleType", a."vehicleBrand", a."vehicleModel", a."fuelType"
ON CONFLICT ("customerId", "licensePlate") DO NOTHING;

-- 3. Lier les rendez-vous existants aux clients et véhicules
UPDATE appointments
SET 
  "customerId" = subquery.customer_id,
  "vehicleId" = subquery.vehicle_id,
  "updatedAt" = NOW()
FROM (
  SELECT 
    a.id as appointment_id,
    c.id as customer_id,
    v.id as vehicle_id
  FROM appointments a
  INNER JOIN customers c ON c.email = a.email
  LEFT JOIN vehicles v ON v."customerId" = c.id AND v."licensePlate" = a."vehicleRegistration"
) as subquery
WHERE appointments.id = subquery.appointment_id;

-- 4. Calculer les statistiques initiales pour chaque client
UPDATE customers c
SET 
  "totalVisits" = (
    SELECT COUNT(*) FROM appointments a 
    WHERE a."customerId" = c.id AND a.status IN ('completed', 'confirmed')
  ),
  "totalCancellations" = (
    SELECT COUNT(*) FROM appointments a 
    WHERE a."customerId" = c.id AND a.status = 'cancelled'
  ),
  "totalNoShows" = (
    SELECT COUNT(*) FROM appointments a 
    WHERE a."customerId" = c.id AND a."actualStatus" = 'no_show'
  ),
  "updatedAt" = NOW();

-- 5. Afficher le résumé de la migration
SELECT 
  'Migration terminée' as status,
  (SELECT COUNT(*) FROM customers) as total_clients,
  (SELECT COUNT(*) FROM vehicles) as total_vehicules,
  (SELECT COUNT(*) FROM appointments WHERE "customerId" IS NOT NULL) as rdv_lies;
