# 🎯 TESTER LE NOUVEAU SYSTÈME - Commandes Rapides

## 🚀 Démarrage Complet

### Option 1 : Tout en Une Commande (Backend + Frontend)

```bash
# Terminal 1 - Backend
cd /home/depop/delivery/part-time/autoaziz/apps/backend && npm start

# Terminal 2 - Frontend (dans un nouveau terminal)
cd /home/depop/delivery/part-time/autoaziz/apps/frontend && npm start
```

### Option 2 : Utiliser les Scripts de Lancement

```bash
# Backend
./launch-backend.sh

# Frontend
./launch-frontend.sh
```

## 🧪 Tests Rapides

### 1. Tester l'API des Créneaux

```bash
# Créneaux de la semaine actuelle
curl http://localhost:3001/appointments/available-slots | jq

# Créneaux de la semaine prochaine
curl http://localhost:3001/appointments/available-slots?weekOffset=1 | jq

# Créneaux de la semaine suivante
curl http://localhost:3001/appointments/available-slots?weekOffset=2 | jq
```

### 2. Tester une Réservation Complète

```bash
curl -X POST http://localhost:3001/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jean Dupont",
    "email": "jean.dupont@test.com",
    "phone": "0612345678",
    "vehicleRegistration": "AB-123-CD",
    "vehicleType": "Voiture",
    "vehicleBrand": "Renault",
    "vehicleModel": "Clio",
    "vehicleYear": 2020,
    "fuelType": "Essence",
    "appointmentDate": "2025-10-20",
    "appointmentTime": "10:00",
    "notes": "Première visite"
  }'
```

### 3. Vérifier les Rendez-vous

```bash
# Via API
curl http://localhost:3001/appointments | jq

# Via Base de Données
docker exec -it autoaziz-postgres-dev psql -U postgres -d autoaziz -c \
  "SELECT id, name, vehicle_brand, vehicle_model, appointment_date, appointment_time FROM appointments;"
```

## 🌐 Accès Navigateur

- **Frontend** : http://localhost:3000
- **Page Réservation** : http://localhost:3000/appointments
- **API Backend** : http://localhost:3001
- **API Docs (Swagger)** : http://localhost:3001/api

## 📊 Scénarios de Test

### ✅ Scénario 1 : Réservation Valide
1. Aller sur http://localhost:3000/appointments
2. Remplir le formulaire (4 étapes)
3. Sélectionner un créneau > 24h
4. Confirmer
5. Vérifier la confirmation

### ❌ Scénario 2 : Tentative < 24h
1. Essayer de sélectionner un créneau pour demain
2. Vérifier le message d'erreur

### 🔴 Scénario 3 : Créneau Complet
1. Créer 2 rendez-vous sur le même créneau
2. Essayer d'en créer un 3ème
3. Vérifier qu'il est marqué "Complet"

### 📅 Scénario 4 : Navigation Calendrier
1. Cliquer sur "Semaine suivante"
2. Naviguer entre les semaines
3. Utiliser le bouton "Aujourd'hui"

## 🔍 Vérifications

### Backend est-il démarré ?
```bash
curl http://localhost:3001/appointments
# Doit retourner un JSON (vide ou avec des rendez-vous)
```

### Frontend est-il démarré ?
```bash
curl http://localhost:3000
# Doit retourner du HTML
```

### PostgreSQL est-il actif ?
```bash
docker ps | grep postgres
# Doit afficher le conteneur autoaziz-postgres-dev
```

## 🐛 Dépannage Rapide

### Le backend ne démarre pas
```bash
cd infrastructure && docker-compose up -d postgres
cd ../apps/backend && npm install && npm start
```

### Le frontend ne démarre pas
```bash
cd apps/frontend && npm install && npm start
```

### Erreur de base de données
```bash
# Recréer la base
docker-compose down
docker-compose up -d postgres
sleep 5
cd ../scripts && ./migrate-database.sh
```

## 📝 Logs en Temps Réel

```bash
# Backend
cd apps/backend && npm run start:dev

# PostgreSQL
docker logs -f autoaziz-postgres-dev

# Tous les conteneurs
docker-compose logs -f
```

## 🎉 Test Complet en 2 Minutes

```bash
# 1. Démarrer tout
cd infrastructure && docker-compose up -d postgres
cd ../apps/backend && npm start &
cd ../apps/frontend && npm start &

# 2. Attendre 30 secondes

# 3. Tester l'API
curl http://localhost:3001/appointments/available-slots

# 4. Ouvrir le navigateur
open http://localhost:3000/appointments

# 5. Faire une réservation complète
# (via l'interface web)
```

---

**Tout est prêt ! Bon test ! 🚀**
