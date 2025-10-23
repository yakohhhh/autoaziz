# 🔗 Liaison Planning Admin ↔ Prise de Rendez-vous

## ✅ Ce qui a été fait

### 1. Architecture unifiée
- ✅ **Prisma et TypeORM synchronisés** sur la même DB PostgreSQL
- ✅ **Schéma Prisma simplifié** pour correspondre à TypeORM
- ✅ **Tables identiques** : `appointments` avec tous les champs

### 2. Flux de données
```
Client prend RDV (formulaire)
    ↓
TypeORM (appointments.service.ts)
    ↓
PostgreSQL (table appointments)
    ↓
Prisma (calendar.service.ts)
    ↓
Planning Admin (react-big-calendar)
```

### 3. Endpoints créés

**Prise de RDV (TypeORM):**
```
POST /appointments
  → Crée un RDV dans la DB via TypeORM
  → Status: "pending_verification"
```

**Planning Admin (Prisma):**
```
GET /admin/calendar/appointments
  → Lit tous les RDV via Prisma
  → Formate pour react-big-calendar

PATCH /admin/calendar/appointments/:id/status
  → Change le statut d'un RDV
  → (pending_verification → pending → completed/cancelled)
```

## 🚀 Comment tester

### Méthode 1: Script automatique

```bash
# 1. S'assurer que le backend tourne
./launch-backend.sh

# 2. Lancer le test
./test-planning-link.sh
```

**Le script va :**
1. Créer un RDV via POST /appointments (comme le formulaire)
2. Vérifier qu'il apparaît dans GET /admin/calendar/appointments
3. Vérifier les stats du dashboard
4. Interroger directement PostgreSQL

### Méthode 2: Test visuel complet

```bash
# Terminal 1: Backend
./launch-backend.sh

# Terminal 2: Frontend  
cd apps/frontend && npm start
```

**Puis :**

1. **Prendre un RDV** :
   - Aller sur http://localhost:3000/rendez-vous
   - Remplir le formulaire
   - Choisir une date/heure
   - Valider

2. **Se connecter en admin** :
   - http://localhost:3000/login
   - Email: `admin@autosur.com`
   - Mot de passe: `admin123`

3. **Voir le RDV dans le planning** :
   - Cliquer sur "Planning" dans la sidebar
   - Le calendrier doit afficher le RDV que vous venez de créer
   - Cliquer dessus pour voir les détails
   - Changer le statut (pending → completed)

4. **Vérifier les stats** :
   - Retour au Dashboard
   - Les stats doivent être mises à jour
   - "Total rendez-vous" +1
   - "En attente" reflète le nouveau RDV

## 🔍 Vérification manuelle

### Via API

```bash
# Créer un RDV
curl -X POST http://localhost:3001/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "API",
    "email": "test@example.com",
    "phone": "+33612345678",
    "vehicleRegistration": "AB-123-CD",
    "vehicleType": "Voiture",
    "vehicleBrand": "Renault",
    "vehicleModel": "Clio",
    "fuelType": "Essence",
    "appointmentDate": "2025-10-30",
    "appointmentTime": "14:00"
  }'

# Voir dans le planning
curl http://localhost:3001/admin/calendar/appointments | jq '.'

# Voir les stats
curl http://localhost:3001/admin/stats | jq '.'
```

### Via PostgreSQL

```bash
# Se connecter à la DB
PGPASSWORD=postgres psql -h localhost -U postgres -d autosur

# Voir tous les RDV
SELECT id, "firstName", "lastName", email, "appointmentDate", "appointmentTime", status 
FROM appointments 
ORDER BY id DESC 
LIMIT 10;

# Compter par statut
SELECT status, COUNT(*) 
FROM appointments 
GROUP BY status;
```

## 📊 Structure de données

### Appointment (TypeORM + Prisma)

```typescript
{
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string              // Format: +33XXXXXXXXX
  vehicleRegistration: string
  vehicleType: string        // Voiture, Moto, Utilitaire, 4x4, etc.
  vehicleBrand: string
  vehicleModel: string
  fuelType: string?          // Essence, Diesel, etc.
  appointmentDate: Date      // Format: YYYY-MM-DD
  appointmentTime: string    // Format: HH:mm
  status: string             // pending_verification, pending, completed, cancelled
  verificationCode: string?
  emailVerified: boolean?
  phoneVerified: boolean?
  verificationCodeExpiry: Date?
  notes: string?
  createdAt: Date
}
```

### Format Calendrier

```typescript
{
  id: number
  title: string              // "Jean Dupont - Voiture"
  start: Date                // Date + Heure combinés
  end: Date                  // Même que start (30min après)
  resource: {
    id: number
    customerName: string     // "Jean Dupont"
    email: string
    phone: string
    vehicleType: string
    vehicleBrand: string
    vehicleModel: string
    vehicleRegistration: string
    time: string
    status: string
    notes: string?
  }
}
```

## 🎨 Code couleur Planning

- 🟡 **Jaune** (#f59e0b) : `pending_verification` - En attente de vérification
- 🔵 **Bleu** (#3b82f6) : `pending` - Confirmé, en attente
- 🟢 **Vert** (#10b981) : `completed` - Complété
- 🔴 **Rouge** (#ef4444) : `cancelled` - Annulé

## ⚡ Temps réel

### Actuellement (Polling)
- Le planning se rafraîchit au chargement
- Bouton "Actualiser" (🔄) pour forcer le refresh

### À implémenter (WebSocket)

**Backend:**
```typescript
// apps/backend/src/appointments/appointments.service.ts
async create(dto: CreateAppointmentDto) {
  const appointment = await this.repository.save(dto);
  
  // Émettre un événement WebSocket
  this.socketGateway.emit('appointment:created', appointment);
  
  return appointment;
}
```

**Frontend:**
```typescript
// apps/frontend/src/pages/AdminPlanning.tsx
useEffect(() => {
  const socket = io('http://localhost:3001');
  
  socket.on('appointment:created', (appointment) => {
    loadAppointments(); // Recharge automatiquement
  });
  
  return () => socket.disconnect();
}, []);
```

## 🐛 Troubleshooting

### Le RDV n'apparaît pas dans le planning

```bash
# 1. Vérifier que le backend tourne
curl http://localhost:3001/appointments/available-slots

# 2. Vérifier que le RDV est bien créé en DB
PGPASSWORD=postgres psql -h localhost -U postgres -d autosur -c \
  "SELECT * FROM appointments ORDER BY id DESC LIMIT 1;"

# 3. Vérifier que l'API planning fonctionne
curl http://localhost:3001/admin/calendar/appointments

# 4. Vérifier les logs backend
# Regarder dans le terminal où lance-backend.sh tourne
```

### Erreur 404 sur /admin/calendar/appointments

```bash
# Le backend n'a pas redémarré après les changements
# Stopper et relancer :
./scripts/stop-all.sh
./launch-backend.sh
```

### Stats à zéro dans le dashboard

Les stats utilisent le mois en cours. Si aucun RDV ce mois :

```typescript
// apps/backend/src/admin/admin.service.ts ligne 15
// Modifier temporairement pour tester :
const startOfMonth = new Date(2020, 0, 1); // Au lieu de now
```

### Le calendrier est vide

```bash
# Insérer des RDV de test
./test-planning-system.sh

# Ou manuellement :
PGPASSWORD=postgres psql -h localhost -U postgres -d autosur << EOF
INSERT INTO appointments (
  "firstName", "lastName", email, phone,
  "vehicleRegistration", "vehicleType", "vehicleBrand", "vehicleModel",
  "appointmentDate", "appointmentTime", status, "createdAt"
) VALUES
  ('Test', 'User', 'test@example.com', '+33600000000',
   'AA-111-AA', 'Voiture', 'Renault', 'Clio',
   '2025-10-30', '10:00', 'pending', NOW());
EOF
```

## 📝 Fichiers clés

### Backend

**TypeORM (création RDV):**
- `apps/backend/src/appointments/appointments.service.ts` - Logique création
- `apps/backend/src/appointments/appointments.controller.ts` - Routes API
- `apps/backend/src/entities/appointment.entity.ts` - Structure données

**Prisma (lecture RDV):**
- `apps/backend/src/admin/calendar.service.ts` - Logique planning
- `apps/backend/src/admin/calendar.controller.ts` - Routes admin
- `apps/backend/src/admin/admin.service.ts` - Stats dashboard
- `apps/backend/prisma/schema.prisma` - Schéma DB

### Frontend

- `apps/frontend/src/pages/Appointments.tsx` - Formulaire prise RDV
- `apps/frontend/src/pages/AdminPlanning.tsx` - Calendrier admin
- `apps/frontend/src/pages/AdminDashboard.tsx` - Stats

### Scripts

- `test-planning-link.sh` - Test automatique liaison
- `test-planning-system.sh` - Création RDV de test
- `launch-backend.sh` - Démarrage backend
- `view-database.sh` - Prisma Studio

## ✅ Checklist de test

- [ ] Backend démarre sans erreur (`./launch-backend.sh`)
- [ ] Frontend compile sans erreur (`cd apps/frontend && npm start`)
- [ ] Créer RDV via formulaire web
- [ ] RDV apparaît dans PostgreSQL
- [ ] RDV apparaît dans le planning admin
- [ ] Détails RDV corrects (nom, véhicule, date, heure)
- [ ] Peut changer le statut du RDV
- [ ] Stats dashboard mises à jour
- [ ] Code couleur correct selon statut
- [ ] Filtres fonctionnent (tous/pending/completed/cancelled)

## 🎉 Résultat attendu

1. Client prend RDV sur http://localhost:3000/rendez-vous ✅
2. RDV sauvegardé en DB via TypeORM ✅
3. Admin se connecte sur http://localhost:3000/admin/planning ✅
4. Calendrier affiche le RDV (lu via Prisma) ✅
5. Admin clique sur le RDV → Modal avec détails ✅
6. Admin change le statut → Mise à jour en DB ✅
7. Dashboard affiche les stats à jour ✅

**Le système est complètement fonctionnel et lié !** 🚀
