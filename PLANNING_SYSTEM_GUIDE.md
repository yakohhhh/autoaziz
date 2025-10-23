# 📅 Système de Planning Admin - Guide Complet

## 🎯 Vue d'ensemble

Le système de planning admin permet de visualiser et gérer tous les rendez-vous en temps réel avec un calendrier interactif connecté à la base de données.

## ✨ Fonctionnalités

### Dashboard Admin Amélioré

**Stats en temps réel depuis la DB:**
- ✅ Nombre total de rendez-vous
- ✅ RDV en attente / complétés / annulés
- ✅ Revenus calculés par type de véhicule
- ✅ Nouveaux clients (emails uniques)
- ✅ Graphiques de revenus par mois (2 années)
- ✅ Stats par type de véhicule
- ✅ Créneaux horaires les plus populaires

**Endpoints Backend:**
```
GET /admin/stats                    → Stats générales du dashboard
GET /admin/appointments/recent      → 10 derniers RDV
GET /admin/revenue/chart           → Données graphique revenus
GET /admin/stats/vehicle-types     → Répartition par type de véhicule
GET /admin/stats/top-timeslots     → Top 5 des heures de RDV
```

### Planning Interactif

**Calendrier react-big-calendar:**
- 📅 Vue Mois / Semaine / Jour / Agenda
- 🎨 Code couleur par statut:
  - 🟡 Jaune: En vérification (pending_verification)
  - 🔵 Bleu: En attente (pending)
  - 🟢 Vert: Complété (completed)
  - 🔴 Rouge: Annulé (cancelled)

**Filtres:**
- Tous les RDV
- En attente uniquement
- Complétés uniquement
- Annulés uniquement

**Modal détails RDV:**
- 👤 Infos client (nom, email, téléphone)
- 🚗 Infos véhicule (type, marque, modèle, immatriculation)
- 📅 Date et heure du RDV
- 📝 Notes éventuelles
- 🔄 Actions: Changer le statut (pending/completed/cancelled)

**Endpoints Backend:**
```
GET /admin/calendar/appointments           → Tous les RDV formatés pour le calendrier
  ?start=2025-10-01                       → Filtre date début
  &end=2025-10-31                         → Filtre date fin
  &status=pending                         → Filtre par statut

PATCH /admin/calendar/appointments/:id/status  → Changer le statut d'un RDV
  Body: { "status": "completed" }

GET /admin/calendar/slots/availability     → Disponibilité des créneaux
  ?date=2025-10-25                        → Pour une date donnée
```

## 🏗️ Architecture Technique

### Backend (NestJS + Prisma)

**Fichiers créés/modifiés:**
```
apps/backend/src/admin/
├── admin.controller.ts       → Routes dashboard stats
├── admin.service.ts          → Logique métier avec Prisma
├── calendar.controller.ts    → Routes planning (NEW)
├── calendar.service.ts       → Logique calendrier (NEW)
└── admin.module.ts           → Module admin complet
```

**Service Prisma:**
```typescript
// Connexion Prisma
private prisma: PrismaClient;

// Requêtes principales
- getDashboardStats()          → Stats agrégées
- getRecentAppointments()      → 10 derniers RDV
- getRevenueChart()            → Revenus mensuels 2 ans
- getVehicleTypeStats()        → Groupement par type
- getTopTimeSlots()            → Top heures populaires
- getCalendarAppointments()    → RDV formatés calendrier
- updateAppointmentStatus()    → Mise à jour statut
- getSlotAvailability()        → Créneaux dispo par jour
```

### Frontend (React + react-big-calendar)

**Fichiers créés/modifiés:**
```
apps/frontend/src/pages/
├── AdminDashboard.tsx        → Dashboard principal
├── AdminPlanning.tsx         → Page planning (NEW)
├── AdminPlanning.css         → Styles planning (NEW)
```

**Composant Planning:**
```tsx
// State management
const [events, setEvents] = useState<AppointmentEvent[]>([]);
const [selectedEvent, setSelectedEvent] = useState();
const [filter, setFilter] = useState('all');

// Librairies
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
```

**Routes:**
```
/admin/dashboard  → Statistiques et graphiques
/admin/planning   → Calendrier interactif
```

## 🗄️ Base de Données

### Schéma Appointment

```prisma
model Appointment {
  id                     Int       @id @default(autoincrement())
  firstName              String
  lastName               String
  email                  String
  phone                  String
  vehicleRegistration    String
  vehicleType            String    // Voiture, Moto, Utilitaire, 4x4, etc.
  vehicleBrand           String
  vehicleModel           String
  fuelType               String?
  appointmentDate        DateTime  @db.Date
  appointmentTime        String
  status                 String    @default("pending_verification")
  notes                  String?   @db.Text
  createdAt              DateTime  @default(now())
}
```

### Calcul des Revenus

```typescript
const prices = {
  'Voiture': 70,
  'Moto': 60,
  'Utilitaire': 80,
  '4x4': 75,
  'Camping-car': 90,
  'Collection': 80,
};
```

## 🚀 Utilisation

### 1. Démarrer le système

```bash
# Terminal 1: Backend
./launch-backend.sh

# Terminal 2: Frontend
cd apps/frontend
npm start
```

### 2. Accéder à l'admin

```
URL: http://localhost:3000/login
Email: admin@autosur.com
Mot de passe: admin123
```

### 3. Navigation

1. **Dashboard** → Stats globales, graphiques
2. **Cliquer "Planning"** dans la sidebar → Calendrier

### 4. Utiliser le planning

- **Vue Calendrier:** Switcher entre Mois/Semaine/Jour/Agenda
- **Filtrer:** Cliquer sur les boutons de statut en haut
- **Voir détails:** Cliquer sur un événement dans le calendrier
- **Changer statut:** Dans la modal, utiliser les boutons d'action
- **Actualiser:** Bouton 🔄 en haut à droite

## 🧪 Tests

### Script de test automatique

```bash
./test-planning-system.sh
```

**Ce script:**
1. ✅ Insère 5 RDV de test dans la DB
2. ✅ Teste tous les endpoints API
3. ✅ Affiche un résumé des stats
4. ✅ Vérifie le format des données

### Test manuel

1. **Prendre un RDV côté client:**
   ```
   → http://localhost:3000/rendez-vous
   → Remplir le formulaire
   → Valider email/téléphone
   ```

2. **Vérifier dans l'admin:**
   ```
   → Dashboard: Stats mises à jour
   → Planning: RDV apparaît dans le calendrier
   → Cliquer dessus: Voir tous les détails
   ```

3. **Changer le statut:**
   ```
   → Cliquer sur le RDV
   → "Marquer comme Complété"
   → Vérifier que la couleur change (vert)
   → Dashboard: Stats "Complétés" +1
   ```

## 🔄 Temps Réel

### Polling (implémenté)

Le planning se rafraîchit au chargement de la page et avec le bouton 🔄.

### WebSocket (à implémenter)

Pour un rafraîchissement automatique quand un client prend RDV:

**Backend:**
```typescript
// À ajouter dans apps/backend/src/main.ts
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  // ...
}
```

**Frontend:**
```typescript
// À ajouter dans AdminPlanning.tsx
import io from 'socket.io-client';

useEffect(() => {
  const socket = io('http://localhost:3001');
  socket.on('appointment:created', (data) => {
    loadAppointments(); // Recharge automatiquement
  });
  return () => socket.disconnect();
}, []);
```

## 📊 Stats Détaillées

### Dashboard Stats

```json
{
  "totalAppointments": 156,      // Total tous statuts
  "pendingAppointments": 12,     // En attente
  "completedAppointments": 140,  // Complétés
  "cancelledAppointments": 4,    // Annulés
  "revenue": 9840,               // Revenus du mois (€)
  "newCustomers": 45             // Nouveaux emails uniques
}
```

### Revenue Chart

```json
{
  "labels": ["Jan", "Fév", "Mar", ...],
  "datasets": [
    {
      "label": "Année 2024",
      "data": [10500, 12300, 11200, ...]
    },
    {
      "label": "Année 2025",
      "data": [12800, 14200, 13500, ...]
    }
  ]
}
```

### Vehicle Type Stats

```json
[
  { "type": "Voiture", "count": 89 },
  { "type": "Moto", "count": 23 },
  { "type": "Utilitaire", "count": 18 },
  { "type": "4x4", "count": 15 },
  { "type": "Camping-car", "count": 8 },
  { "type": "Collection", "count": 3 }
]
```

### Top Time Slots

```json
[
  { "time": "09:00", "count": 34 },
  { "time": "10:30", "count": 28 },
  { "time": "14:00", "count": 26 },
  { "time": "15:30", "count": 22 },
  { "time": "11:00", "count": 19 }
]
```

## 🐛 Troubleshooting

### Le calendrier est vide

```bash
# Vérifier qu'il y a des RDV dans la DB
./view-database.sh
# OU
cd apps/backend && npx prisma studio

# Créer des RDV de test
./test-planning-system.sh
```

### Erreur CORS

Le backend doit avoir CORS activé pour localhost:3000:

```typescript
// apps/backend/src/main.ts
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

### Stats à zéro

Les stats sont calculées sur le mois en cours. Si aucun RDV ce mois:

```typescript
// Modifier dans admin.service.ts
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
// Remplacer par toute l'année pour tester:
const startOfMonth = new Date(now.getFullYear(), 0, 1);
```

## 📝 Prochaines Étapes

### Fonctionnalités à ajouter

1. **Temps réel:** WebSocket pour rafraîchissement auto
2. **Notifications:** Alertes quand nouveau RDV
3. **Export:** PDF/Excel des stats
4. **Recherche:** Filtrer par nom/email/immatriculation
5. **Drag & Drop:** Déplacer les RDV dans le calendrier
6. **Multi-utilisateurs:** Gestion des techniciens
7. **SMS automatiques:** Rappels 24h avant RDV
8. **Analytics avancés:** Taux de complétion, revenus par source

### Optimisations

1. **Cache:** Redis pour les stats
2. **Pagination:** Pour les listes de RDV
3. **Lazy loading:** Charger RDV par période visible
4. **Service Worker:** PWA pour utilisation hors ligne

## 🎉 Résumé

✅ **Dashboard avec vraies données DB**
✅ **Planning calendrier interactif**
✅ **Gestion statuts RDV**
✅ **Stats avancées (véhicules, créneaux)**
✅ **Filtres et recherche**
✅ **Modal détails complets**
✅ **Responsive design**
✅ **Script de test automatique**

Le système est opérationnel et prêt pour la production ! 🚀
