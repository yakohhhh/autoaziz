#!/bin/bash

echo "🔗 Test de liaison Planning Admin ↔ Prise de Rendez-vous"
echo "=========================================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📝 Étape 1: Créer un rendez-vous via l'API client${NC}"
echo ""

# Créer un RDV comme le ferait le formulaire frontend
RESPONSE=$(curl -s -X POST http://localhost:3001/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Planning",
    "email": "test.planning@example.com",
    "phone": "+33612345678",
    "vehicleRegistration": "TEST-123",
    "vehicleType": "Voiture",
    "vehicleBrand": "Peugeot",
    "vehicleModel": "208",
    "fuelType": "Essence",
    "appointmentDate": "2025-10-30",
    "appointmentTime": "10:00"
  }')

echo "Réponse API:"
echo "$RESPONSE" | jq '.'
echo ""

# Extraire l'ID du rendez-vous créé
APPOINTMENT_ID=$(echo "$RESPONSE" | jq -r '.id')

if [ "$APPOINTMENT_ID" != "null" ] && [ -n "$APPOINTMENT_ID" ]; then
    echo -e "${GREEN}✅ Rendez-vous créé avec ID: $APPOINTMENT_ID${NC}"
else
    echo -e "${YELLOW}⚠️  Problème lors de la création du rendez-vous${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📊 Étape 2: Vérifier dans le planning admin (via Prisma)${NC}"
echo ""

# Attendre un peu pour être sûr que c'est bien en DB
sleep 1

# Récupérer le RDV via l'API admin (qui utilise Prisma)
ADMIN_RESPONSE=$(curl -s http://localhost:3001/admin/calendar/appointments)

# Chercher notre RDV
FOUND=$(echo "$ADMIN_RESPONSE" | jq --arg email "test.planning@example.com" '[.[] | select(.resource.email == $email)] | length')

if [ "$FOUND" -gt 0 ]; then
    echo -e "${GREEN}✅ Rendez-vous trouvé dans le planning admin!${NC}"
    echo ""
    echo "Détails du rendez-vous dans le calendrier:"
    echo "$ADMIN_RESPONSE" | jq --arg email "test.planning@example.com" '[.[] | select(.resource.email == $email)][0]'
else
    echo -e "${YELLOW}❌ Rendez-vous NON trouvé dans le planning admin${NC}"
    echo "Nombre total de RDV dans le planning: $(echo "$ADMIN_RESPONSE" | jq 'length')"
fi

echo ""
echo -e "${BLUE}📈 Étape 3: Vérifier dans les stats du dashboard${NC}"
echo ""

STATS=$(curl -s http://localhost:3001/admin/stats)
echo "Stats dashboard:"
echo "$STATS" | jq '.'

echo ""
echo -e "${BLUE}🔍 Étape 4: Vérification directe en base de données${NC}"
echo ""

# Vérifier directement dans PostgreSQL
PGPASSWORD=postgres psql -h localhost -U postgres -d autosur -c "
SELECT 
    id,
    \"firstName\",
    \"lastName\",
    email,
    \"appointmentDate\",
    \"appointmentTime\",
    status,
    \"createdAt\"
FROM appointments 
WHERE email = 'test.planning@example.com'
ORDER BY id DESC
LIMIT 1;
" 2>/dev/null

echo ""
echo -e "${GREEN}✅ Test terminé!${NC}"
echo ""
echo "📌 Points à vérifier:"
echo "   1. Le RDV a été créé par TypeORM (appointments.service.ts)"
echo "   2. Le RDV apparaît dans le planning admin via Prisma (calendar.service.ts)"
echo "   3. Les stats sont mises à jour (admin.service.ts)"
echo "   4. La DB PostgreSQL contient bien le RDV"
echo ""
echo "🌐 Pour tester visuellement:"
echo "   • Prendre RDV: http://localhost:3000/rendez-vous"
echo "   • Voir planning: http://localhost:3000/admin/planning"
echo "   • Login admin: admin@autosur.com / admin123"
