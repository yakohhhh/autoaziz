# 🚗 Auto Aziz - Système de Prise de Rendez-vous

> Plateforme moderne de gestion de rendez-vous pour garage automobile avec vérification par email/SMS et interface cartographique.

## 📁 Structure du projet

```
autoaziz/
├── apps/                    # Applications principales
│   ├── backend/            # API NestJS
│   ├── frontend/           # Interface React ⭐ Architecture restructurée !
│   ├── mobile/             # 📱 Application Mobile Ionic React (NOUVEAU!)
│   └── database/           # Configuration PostgreSQL
├── docs/                   # Documentation complète
│   ├── NEW_ARCHITECTURE.md      # 📘 Documentation de la nouvelle architecture
│   ├── ARCHITECTURE_GUIDE.md    # 📗 Guide de démarrage
│   ├── MIGRATION_GUIDE.md       # 📙 Guide de migration
│   └── ...                      # Autres documentations
├── scripts/                # Scripts d'automatisation
├── infrastructure/         # Docker & déploiement
├── tools/                  # Outils de développement
└── .github/               # CI/CD GitHub Actions
```

> 🎉 **Nouveau !** Le frontend a été restructuré selon les meilleures pratiques React/TypeScript.  
> Consultez [NEW_ARCHITECTURE.md](docs/NEW_ARCHITECTURE.md) pour plus de détails.

## 🚀 Démarrage ULTRA-RAPIDE ⭐

### Tout en une commande !

```bash
# Lancer TOUT (PostgreSQL + Backend + Frontend)
./launch-all.sh
```

Le script s'occupe de tout :
- ✅ Démarre PostgreSQL automatiquement
- ✅ Crée la base de données si besoin
- ✅ Lance le backend (NestJS)
- ✅ Lance le frontend (React)
- ✅ Ouvre le navigateur

**Accès direct :** http://localhost:3000/login
- **Email:** `admin@autosur.com`
- **Password:** `admin123`

### 📱 Application Mobile (NOUVEAU!)

```bash
# Lancer l'application mobile Ionic React
./launch-mobile.sh
```

**Accès mobile :** http://localhost:8100

> 📱 **Application réservée au patron** pour gérer planning, rendez-vous, clients et statistiques  
> 🎨 **Design 100% identique au web** - Même direction artistique  
> 📖 **Documentation complète** : [mobile/GUIDE.md](mobile/GUIDE.md)

### Pour arrêter tous les services

```bash
./scripts/stop-all.sh
```

---

## 📖 Méthode manuelle (alternative)

### Prérequis
- Node.js 18+
- PostgreSQL 15+
- Docker (optionnel)

### Installation
```bash
# Cloner le projet
git clone https://github.com/yakohhhh/autoaziz.git
cd autoaziz

# Installer les dépendances backend
cd apps/backend
npm install

# Installer les dépendances frontend  
cd ../frontend
npm install
```

### Lancement manuel

**Option 1 : Scripts séparés**
```bash
# Terminal 1 - Backend (avec PostgreSQL)
./launch-backend.sh

# Terminal 2 - Frontend
./launch-frontend.sh
```

**Option 2 : Commandes npm classiques**
```bash
# Backend (API)
cd apps/backend
npm run start:dev

# Frontend (Interface)
cd apps/frontend  
npm start
```

## 📋 Applications

### 🔧 Backend (NestJS)
- **Localisation** : `apps/backend/`
- **API REST** avec Swagger/OpenAPI
- **Base de données** PostgreSQL avec TypeORM
- **Authentification** et vérification par code
- **Emails** avec templates MJML
- **SMS** via services externes

### 🎨 Frontend (React)
- **Localisation** : `apps/frontend/`  
- **Interface moderne** avec TypeScript
- **Architecture restructurée** (Oct 2025) 🆕
  - Pages organisées par contexte (public, admin, auth)
  - Composants organisés par fonction (layout, common, calendar)
  - Hooks personnalisés pour la logique réutilisable
  - Services API centralisés
  - Types TypeScript centralisés
  - Barrel exports pour imports simplifiés
- **Carte interactive** Leaflet/OpenStreetMap
- **Formulaires** de prise de rendez-vous
- **Vérification** temps réel des codes

> 📖 **Documentation détaillée** : [NEW_ARCHITECTURE.md](docs/NEW_ARCHITECTURE.md)

### 📱 Mobile (Ionic React) 🆕
- **Localisation** : `apps/mobile/`  
- **Application native** iOS et Android
- **Progressive Web App** (PWA)
- **Design 100% identique au web**
  - Mêmes couleurs (#667eea, #c174f2)
  - Mêmes gradients et style
  - Interface responsive et moderne
- **Fonctionnalités**
  - 📊 Tableau de bord avec statistiques temps réel
  - 📅 Planning et gestion des rendez-vous
  - ➕ Ajout rapide de RDV avec formulaire complet
  - 👥 Liste des clients avec recherche avancée
  - 📈 Graphiques interactifs (Recharts)
  - 🔍 Recherche et filtres puissants
  - ↻ Pull-to-refresh
  - 📱 Navigation par onglets (bottom tabs)

> 📖 **Documentation mobile** : [mobile/GUIDE.md](mobile/GUIDE.md)  
> 🚀 **Lancement** : `./launch-mobile.sh`

## 🛠️ Scripts disponibles

### Développement
```bash
# Linting complet du projet
./scripts/lint.sh

# Tests et validation
./scripts/validate-push.sh

# Monitoring des logs
./scripts/monitor.sh
```

### Déploiement
```bash
# Installation complète
./scripts/install.sh

# Configuration serveur
./scripts/server-setup.sh

# Déploiement production
./scripts/deploy-production.sh
```

## 🐳 Docker

```bash
# Développement
docker-compose -f infrastructure/docker-compose.yml up

# Production
docker-compose -f infrastructure/docker-compose.prod.yml up -d
```

## 📚 Documentation

Consultez le dossier `docs/` pour :
- **🆕 [Nouvelle Architecture](docs/NEW_ARCHITECTURE.md)** - Documentation complète de la restructuration
- **🆕 [Guide d'Architecture](docs/ARCHITECTURE_GUIDE.md)** - Guide de démarrage rapide
- **🆕 [Guide de Migration](docs/MIGRATION_GUIDE.md)** - Comparaison avant/après
- [Guide de déploiement](docs/DEPLOYMENT.md)
- [Configuration ESLint](docs/ESLINT_SETUP.md) 
- [Secrets GitHub](docs/GITHUB_SECRETS_GUIDE.md)
- [Résolution des problèmes](docs/GITHUB_ACTIONS_FIX.md)
- [Et plus encore...](docs/)

## 🔧 Développement

### Qualité du code
- **ESLint** + **Prettier** pour le style
- **Tests unitaires** Jest + Testing Library
- **Pre-commit hooks** avec validation
- **CI/CD** GitHub Actions

### Architecture
- **Clean Architecture** avec séparation des responsabilités
- **Design Patterns** : Repository, DTO, Services
- **TypeScript** strict sur tout le projet
- **Configuration** centralisée par environnement

## 🚀 CI/CD

GitHub Actions automatisé :
- ✅ Tests & Quality Checks
- ✅ Builds & Validation
- ✅ Security Audits
- ✅ Docker Images
- ✅ Déploiement automatique

## 📞 Support

Pour toute question ou problème :
1. Consultez la [documentation](docs/)
2. Vérifiez les [issues GitHub](https://github.com/yakohhhh/autoaziz/issues)
3. Créez une nouvelle issue si nécessaire

## 📝 Licence

Ce projet est sous licence privée. Tous droits réservés.

---

**Développé avec ❤️ pour Auto Aziz** 🚗