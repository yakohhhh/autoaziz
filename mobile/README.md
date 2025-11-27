# 📱 AUTOSUR Mobile - Application Mobile Admin

Application mobile Ionic React pour la gestion du garage AUTOSUR. Cette application permet aux administrateurs de gérer les rendez-vous, les clients et de consulter les statistiques depuis leur mobile.

## 🚀 Fonctionnalités - 100% INTÉGRÉES AU BACKEND

### ✅ **Synchronisation Temps Réel avec le Backend**

Toute l'application est **entièrement connectée au backend NestJS** :

#### 🔐 **Authentification**
- Page de connexion sécurisée avec tokens JWT
- Credentials de démo : `admin@autosur.com` / `admin123`
- Intercepteurs Axios pour authentification automatique

#### 📊 **Dashboard - API : `/api/admin/stats/dashboard`**
- Statistiques en temps réel depuis le backend :
  - Total rendez-vous
  - Rendez-vous en attente, confirmés, terminés
  - Chiffre d'affaires
  - Nouveaux clients
- Graphiques interactifs (Recharts)
- Pull-to-refresh

#### 📅 **Planning - API : `/api/admin/calendar/appointments`**
- **Liste des RDV synchronisée** avec web et backend
- **Si un client prend RDV sur le web → apparaît sur mobile**
- Filtres par statut (tous, en attente, confirmés, terminés)
- Recherche multi-critères
- Actions :
  - Confirmer/Annuler un rendez-vous (sync immédiate)
  - Créer nouveau RDV (visible sur web instantanément)
- Formulaire complet : prénom, nom, téléphone, email, véhicule, date/heure

#### 👥 **Clients - API : `/api/admin/customers`**
- Liste complète des clients depuis le backend
- Recherche par nom, email, téléphone, véhicule
- Affichage véhicules et historique
- Pull-to-refresh
  - Dark: `#1a1a2e`
  - Background: `#f3f4f6`
- Gradients et ombres identiques
- Typography et espacements cohérents
- Interface 100% responsive

## 🚀 Fonctionnalités

### 📊 Tableau de bord
- Statistiques en temps réel
  - Total des rendez-vous
  - Nouveaux clients
  - RDV confirmés
  - Chiffre d'affaires
  - RDV complétés et annulés
- Graphiques interactifs
  - Évolution des RDV par mois (Line Chart)
  - Chiffre d'affaires par semaine (Bar Chart)
- Sélecteur de période (semaine/mois/année)
- Pull to refresh

### 📅 Planning
- Vue liste des rendez-vous groupés par date
- Filtres par statut (tous, en attente, confirmés, terminés)
- Recherche par client, service, véhicule
- Actions rapides :
  - Confirmer un RDV
  - Annuler un RDV
- Ajout de nouveau rendez-vous
  - Formulaire complet
  - Sélection de date et heure
  - Informations client et véhicule
  - Notes personnalisées
- Pull to refresh
- Badge de statut coloré

### 👥 Clients
- Liste complète des clients
- Statistiques rapides
  - Total clients
  - Total véhicules
  - Total RDV
- Recherche avancée (nom, email, téléphone, véhicule, plaque)
- Fiche client détaillée :
  - Informations de contact (appel/email direct)
  - Liste des véhicules
  - Nombre total de RDV
  - Date de dernière visite
  - Badge VIP (> 10 RDV)
- Pull to refresh

## 📦 Installation

```bash
cd mobile

# Installer les dépendances
npm install

# Lancer l'app en mode développement
ionic serve

# ou
npm start
```

## 🔧 Configuration

### Variables d'environnement

Créer un fichier `.env` à la racine du projet mobile :

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_NAME=AutoAziz Mobile
```

Pour la production, utilisez l'URL du backend de production.

## 📱 Build & Déploiement

### Build Web (Progressive Web App)
```bash
ionic build
```

### Ajouter une plateforme mobile

#### Android
```bash
ionic capacitor add android
ionic capacitor sync android
ionic capacitor open android
```

#### iOS
```bash
ionic capacitor add ios
ionic capacitor sync ios
ionic capacitor open ios
```

### Build pour les stores

#### Android APK/AAB
```bash
# Synchroniser
ionic capacitor sync android

# Ouvrir Android Studio
ionic capacitor open android

# Dans Android Studio:
# Build > Generate Signed Bundle / APK
```

#### iOS
```bash
# Synchroniser
ionic capacitor sync ios

# Ouvrir Xcode
ionic capacitor open ios

# Dans Xcode:
# Product > Archive
```

## 🎯 Architecture

```
mobile/
├── src/
│   ├── pages/              # Pages de l'application
│   │   ├── Dashboard.tsx   # Tableau de bord avec stats
│   │   ├── Dashboard.css
│   │   ├── Planning.tsx    # Planning et RDV
│   │   ├── Planning.css
│   │   ├── Customers.tsx   # Liste clients
│   │   └── Customers.css
│   ├── services/           # Services API
│   │   └── api.ts          # Client API et interfaces
│   ├── theme/              # Thème et styles
│   │   └── variables.css   # Variables de couleur
│   ├── App.tsx             # Component principal avec navigation
│   └── index.tsx           # Point d'entrée
├── public/
├── capacitor.config.ts     # Configuration Capacitor
└── package.json
```

## 🔌 API Backend

L'application communique avec le backend NestJS :

- Base URL: `http://localhost:3001` (dev)
- Endpoints utilisés :
  - `GET /api/admin/stats` - Statistiques du tableau de bord
  - `GET /api/admin/appointments` - Liste des RDV
  - `POST /api/admin/appointments` - Créer un RDV
  - `PATCH /api/admin/appointments/:id/status` - Mettre à jour le statut
  - `GET /api/admin/customers` - Liste des clients

## 📊 Graphiques

Utilise **Recharts** pour les visualisations :
- LineChart : Évolution des RDV
- BarChart : Chiffre d'affaires
- Responsive et interactif
- Tooltips personnalisés

## 🎨 Composants Ionic

L'application utilise les composants Ionic suivants :
- IonTabs / IonTabBar - Navigation par onglets
- IonCard - Cartes de contenu
- IonChip - Badges et étiquettes
- IonModal - Dialogues
- IonSearchbar - Recherche
- IonSegment - Filtres
- IonRefresher - Pull to refresh
- IonFab - Bouton flottant
- IonDatetime - Sélecteur de date/heure

## 🌐 Progressive Web App (PWA)

L'application peut être installée comme PWA :
- Fonctionne hors ligne (avec Service Worker)
- Icône sur l'écran d'accueil
- Plein écran
- Notifications push (à venir)

## 🔐 Authentification

À implémenter :
- Page de login
- Stockage du token JWT
- Protection des routes
- Déconnexion

## 📱 Fonctionnalités Natives (via Capacitor)

- Haptics (vibrations)
- Status Bar (personnalisation)
- Keyboard (gestion clavier)
- Camera (à venir pour photos de véhicules)
- Contacts (import contacts)
- Calendar (export RDV)

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests e2e
npm run test:e2e
```

## 🎯 Prochaines fonctionnalités

- [ ] Authentification complète
- [ ] Mode hors ligne avec synchronisation
- [ ] Notifications push
- [ ] Export PDF des statistiques
- [ ] Scan de documents (permis, carte grise)
- [ ] Chat avec les clients
- [ ] Géolocalisation du garage

## 📝 Notes de développement

- Framework : Ionic React
- Build tool : Vite
- Plateforme : Capacitor
- Charts : Recharts
- HTTP Client : Axios
- TypeScript strict mode

## 🆘 Support

Pour toute question ou problème, consultez :
- [Documentation Ionic](https://ionicframework.com/docs)
- [Documentation Capacitor](https://capacitorjs.com/docs)
- [Documentation React](https://react.dev)

## 📄 Licence

Propriété de AutoAziz - Tous droits réservés
