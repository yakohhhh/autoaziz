#!/bin/bash

# Script de test du système de planning admin

echo "🚀 Test du système de planning admin"
echo "===================================="
echo ""

# 1. Créer quelques rendez-vous de test dans la DB
echo "📝 Création de rendez-vous de test..."
echo ""

PGPASSWORD=postgres psql -h localhost -U postgres -d autosur << EOF
-- Insérer des RDV de test
INSERT INTO appointments (
  "firstName", "lastName", email, phone, 
  "vehicleRegistration", "vehicleType", "vehicleBrand", "vehicleModel", "fuelType",
  "appointmentDate", "appointmentTime", status, "createdAt"
) VALUES
  ('Jean', 'Dupont', 'jean@example.com', '+33612345678', 
   'AB-123-CD', 'Voiture', 'Renault', 'Clio', 'Essence',
   '2025-10-25', '09:00', 'pending', NOW()),
  ('Marie', 'Martin', 'marie@example.com', '+33623456789',
   'EF-456-GH', 'Voiture', 'Peugeot', '208', 'Diesel',
   '2025-10-25', '10:30', 'pending', NOW()),
  ('Pierre', 'Bernard', 'pierre@example.com', '+33634567890',
   'IJ-789-KL', 'Utilitaire', 'Renault', 'Kangoo', 'Diesel',
   '2025-10-26', '14:00', 'completed', NOW() - INTERVAL '2 days'),
  ('Sophie', 'Dubois', 'sophie@example.com', '+33645678901',
   'MN-012-OP', '4x4', 'Toyota', 'Land Cruiser', 'Diesel',
   '2025-10-27', '11:00', 'pending', NOW()),
  ('Luc', 'Thomas', 'luc@example.com', '+33656789012',
   'QR-345-ST', 'Moto', 'Yamaha', 'MT-07', 'Essence',
   '2025-10-24', '15:30', 'cancelled', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Afficher le résumé
SELECT 
  status,
  COUNT(*) as count,
  SUM(CASE 
    WHEN "vehicleType" = 'Voiture' THEN 70
    WHEN "vehicleType" = 'Moto' THEN 60
    WHEN "vehicleType" = 'Utilitaire' THEN 80
    WHEN "vehicleType" = '4x4' THEN 75
    WHEN "vehicleType" = 'Camping-car' THEN 90
    WHEN "vehicleType" = 'Collection' THEN 80
    ELSE 70
  END) as revenue
FROM appointments
GROUP BY status
ORDER BY status;

EOF

echo ""
echo "✅ Rendez-vous de test créés!"
echo ""
echo "📊 Test des endpoints API:"
echo ""

# 2. Tester l'endpoint des stats
echo "1️⃣ GET /admin/stats"
curl -s http://localhost:3001/admin/stats | jq '.'
echo ""

# 3. Tester l'endpoint du calendrier
echo "2️⃣ GET /admin/calendar/appointments"
curl -s http://localhost:3001/admin/calendar/appointments | jq '. | length'
echo " rendez-vous récupérés"
echo ""

# 4. Tester l'endpoint des RDV récents
echo "3️⃣ GET /admin/appointments/recent"
curl -s http://localhost:3001/admin/appointments/recent | jq '.[0:3]'
echo ""

# 5. Tester l'endpoint du graphique
echo "4️⃣ GET /admin/revenue/chart"
curl -s http://localhost:3001/admin/revenue/chart | jq '.datasets[].label'
echo ""

# 6. Tester les nouvelles stats
echo "5️⃣ GET /admin/stats/vehicle-types"
curl -s http://localhost:3001/admin/stats/vehicle-types | jq '.'
echo ""

echo "6️⃣ GET /admin/stats/top-timeslots"
curl -s http://localhost:3001/admin/stats/top-timeslots | jq '.'
echo ""

echo "✅ Tests terminés!"
echo ""
echo "🌐 Accès au système:"
echo "  - Dashboard: http://localhost:3000/admin/dashboard"
echo "  - Planning: http://localhost:3000/admin/planning"
echo "  - Login: admin@autosur.com / admin123"
echo ""
echo "🗄️ Base de données:"
echo "  - Prisma Studio: cd apps/backend && npx prisma studio"
echo "  - Script: ./view-database.sh"
