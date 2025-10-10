# Auto Aziz - Site Vitrine de Contrôle Technique Automobile

Un site web moderne et responsive pour un centre de contrôle technique automobile, développé avec React (frontend) et NestJS (backend).

## 🚀 Fonctionnalités

### Frontend (React + TypeScript)
- **Design moderne et responsive** - Compatible mobile et desktop
- **Pages principales** :
  - 🏠 Accueil - Présentation de l'entreprise
  - 🔧 Services - Liste des services proposés
  - 💰 Tarifs - Grille tarifaire transparente
  - 📅 Rendez-vous - Système de prise de rendez-vous en ligne
  - 📍 Contact - Formulaire de contact et carte interactive
- **Carte interactive** avec React-Leaflet
- **Formulaires sécurisés** avec validation
- **Informations claires** : adresse, horaires, téléphone

### Backend (NestJS + PostgreSQL)
- **API REST** avec documentation Swagger automatique
- **Gestion des contacts** - Stockage et notification par email
- **Gestion des rendez-vous** - Système de réservation
- **Emails automatiques** - Confirmations pour clients et notifications admin
- **Base de données PostgreSQL** avec TypeORM
- **Architecture modulaire** et évolutive
- **Validation des données** avec class-validator

## 📋 Prérequis

- Node.js (v16 ou supérieur)
- npm ou yarn
- PostgreSQL (ou Docker pour utiliser docker-compose)

## 🛠️ Installation

### 1. Cloner le repository
```bash
git clone https://github.com/yakohhhh/autoaziz.git
cd autoaziz
```

### 2. Configuration de la base de données

**Option A : Avec Docker (recommandé)**
```bash
docker-compose up -d
```

**Option B : PostgreSQL local**
- Installer PostgreSQL
- Créer une base de données nommée `autoaziz`

### 3. Configuration du Backend

```bash
cd backend
npm install
```

Créer un fichier `.env` :
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=autoaziz

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@autoaziz.com

# Application
PORT=3001
NODE_ENV=development
```

Démarrer le backend :
```bash
npm run start:dev
```

Le backend sera accessible sur http://localhost:3001
La documentation Swagger sur http://localhost:3001/api

### 4. Configuration du Frontend

```bash
cd ../frontend
npm install
```

Démarrer le frontend :
```bash
npm start
```

Le frontend sera accessible sur http://localhost:3000

## 📚 Documentation API

La documentation Swagger est disponible à l'adresse : http://localhost:3001/api

### Endpoints principaux

#### Contacts
- `POST /contacts` - Créer un nouveau message de contact
- `GET /contacts` - Liste tous les messages
- `GET /contacts/:id` - Détails d'un message

#### Rendez-vous
- `POST /appointments` - Créer un nouveau rendez-vous
- `GET /appointments` - Liste tous les rendez-vous
- `GET /appointments/:id` - Détails d'un rendez-vous
- `PATCH /appointments/:id/status` - Mettre à jour le statut

## 🏗️ Structure du Projet

```
autoaziz/
├── backend/                 # Application NestJS
│   ├── src/
│   │   ├── appointments/   # Module rendez-vous
│   │   ├── contacts/       # Module contacts
│   │   ├── email/          # Service email
│   │   ├── entities/       # Entités TypeORM
│   │   ├── dto/            # DTOs de validation
│   │   └── main.ts         # Point d'entrée
│   └── package.json
│
├── frontend/               # Application React
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/         # Pages de l'application
│   │   ├── utils/         # Utilitaires
│   │   └── App.tsx        # Composant principal
│   └── package.json
│
├── docker-compose.yml     # Configuration Docker
└── README.md
```

## 🎨 Technologies Utilisées

### Frontend
- React 18
- TypeScript
- React Router DOM
- Axios
- React-Leaflet (cartes interactives)
- CSS personnalisé

### Backend
- NestJS
- TypeORM
- PostgreSQL
- Swagger/OpenAPI
- Nodemailer
- class-validator

## 🚀 Déploiement

### Backend
```bash
cd backend
npm run build
npm run start:prod
```

### Frontend
```bash
cd frontend
npm run build
# Les fichiers statiques seront dans le dossier build/
```

## 🔒 Sécurité

- Validation des données avec class-validator
- Protection CORS configurée
- Variables d'environnement pour les données sensibles
- Sanitisation des entrées utilisateur

## 📝 Licence

Ce projet est sous licence MIT.

## 👥 Contributeurs

- Développé pour Auto Aziz

## 📞 Support

Pour toute question ou support, contactez-nous à : contact@autoaziz.fr