# 🚀 Guide de Démarrage Rapide - Nouveau Système de Réservation

## ✅ Ce qui a été fait

Votre système de réservation a été complètement amélioré avec :

1. ✅ **Calendrier hebdomadaire interactif** avec navigation
2. ✅ **Formulaire véhicule complet** (marque, modèle, année, carburant)
3. ✅ **Validation automatique** (pas de réservation < 24h ou dans le passé)
4. ✅ **Gestion intelligente des créneaux** (capacité de 2 véhicules par créneau)
5. ✅ **Migration de base de données** exécutée avec succès

## 🎯 Comment Démarrer

### 1. Base de données (✅ DÉJÀ FAIT)
La migration a été exécutée automatiquement. PostgreSQL contient maintenant tous les nouveaux champs.

### 2. Démarrer le Backend

```bash
cd /home/depop/delivery/part-time/autoaziz/apps/backend
npm start
```

Le backend sera disponible sur : http://localhost:3001

### 3. Démarrer le Frontend

```bash
cd /home/depop/delivery/part-time/autoaziz/apps/frontend
npm start
```

Le frontend sera disponible sur : http://localhost:3000

## 🧪 Tester le Nouveau Système

### Tester l'API des créneaux :

```bash
# Récupérer les créneaux de la semaine actuelle
curl http://localhost:3001/appointments/available-slots

# Récupérer les créneaux de la semaine prochaine
curl http://localhost:3001/appointments/available-slots?weekOffset=1
```

### Tester depuis le navigateur :

1. Aller sur http://localhost:3000/appointments
2. Remplir le formulaire en 4 étapes :
   - **Étape 1** : Vos coordonnées
   - **Étape 2** : Informations complètes du véhicule
   - **Étape 3** : Sélection du créneau dans le calendrier
   - **Étape 4** : Récapitulatif et confirmation

## 📊 Vérifier les Données

### Voir les rendez-vous dans la base de données :

```bash
docker exec -it autoaziz-postgres-dev psql -U postgres -d autoaziz -c "SELECT id, name, vehicle_brand, vehicle_model, vehicle_year, appointment_date, appointment_time FROM appointments;"
```

## 🎨 Fonctionnalités du Calendrier

### Navigation :
- ⬅️ **Semaine précédente** : Naviguer vers le passé (si semaine actuelle ou après)
- ➡️ **Semaine suivante** : Naviguer vers le futur
- 🏠 **Aujourd'hui** : Retour rapide à la semaine actuelle

### Créneaux :
- 🟢 **Vert** : Créneaux disponibles
- 🟠 **Orange** : Places limitées (1 place restante)
- 🔴 **Rouge** : Complet (2 véhicules réservés)
- 🔵 **Bleu** : Créneau sélectionné

### Messages automatiques :
- ⏰ **Date passée** : Message "Date passée"
- ⚠️ **< 24h** : Message "Réservation impossible - Minimum 24h à l'avance"
- 🔒 **Dimanche** : Message "Fermé"

## 📋 Configuration des Horaires

Modifiez les horaires dans : `apps/backend/src/appointments/slots.service.ts`

```typescript
private readonly OPENING_HOURS = {
  weekday: ['08:00', '08:30', ...], // Lundi-Vendredi
  saturday: ['08:00', '08:30', ...], // Samedi
  sunday: [], // Fermé
};
```

### Modifier la capacité par créneau :

```typescript
private readonly CAPACITY_PER_SLOT = 2; // Nombre de véhicules simultanés
```

## 🚗 Ajouter des Marques/Modèles

Modifiez : `apps/frontend/src/utils/vehicleData.ts`

```typescript
export const VEHICLE_BRANDS: Record<string, VehicleBrand[]> = {
  Voiture: [
    {
      name: 'Nouvelle Marque',
      models: ['Modèle 1', 'Modèle 2', 'Modèle 3'],
    },
    // ...
  ],
};
```

## 🔧 Résolution de Problèmes

### Le backend ne démarre pas :
```bash
# Vérifier que PostgreSQL est en cours d'exécution
docker ps | grep postgres

# Si non, démarrer PostgreSQL
cd infrastructure && docker-compose up -d postgres
```

### Erreur de connexion à la base de données :
```bash
# Vérifier les logs
docker logs autoaziz-postgres-dev

# Vérifier que le port 5432 est libre
sudo lsof -i :5432
```

### Le frontend ne compile pas :
```bash
cd apps/frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

## 📱 Tests Recommandés

### ✅ Scénarios à tester :

1. **Réservation normale** : 
   - Remplir le formulaire complet
   - Sélectionner un créneau > 24h
   - Confirmer

2. **Validation < 24h** :
   - Essayer de réserver pour demain
   - Vérifier le message d'erreur

3. **Capacité pleine** :
   - Créer 2 rendez-vous sur le même créneau
   - Vérifier que le 3ème affiche "Complet"

4. **Navigation calendrier** :
   - Naviguer entre les semaines
   - Utiliser le bouton "Aujourd'hui"

5. **Formulaire véhicule** :
   - Changer le type de véhicule
   - Vérifier que la liste de marques se met à jour
   - Changer la marque
   - Vérifier que la liste de modèles se met à jour

## 📝 Logs Utiles

### Backend :
```bash
cd apps/backend
npm run start:dev
# Les logs s'affichent en temps réel
```

### Base de données :
```bash
docker logs -f autoaziz-postgres-dev
```

## 🎉 C'est Prêt !

Le système est maintenant opérationnel avec toutes les améliorations. Profitez-en ! 

Pour toute question, consultez la documentation complète dans :
- `/docs/BOOKING_SYSTEM_UPGRADE.md`
- `/docs/ARCHITECTURE.md`

---

**Dernière mise à jour :** 16 Octobre 2025
