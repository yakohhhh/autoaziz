# 🚗 Auto Aziz - Système de Prise de Rendez-vous

> Plateforme moderne de gestion de rendez-vous pour garage automobile avec vérification par email/SMS et interface cartographique.

## 📁 Structure du projet

```
autoaziz/
├── apps/                    # Applications principales
│   ├── backend/            # API NestJS
│   ├── frontend/           # Interface React
│   └── database/           # Configuration PostgreSQL
├── docs/                   # Documentation complète
├── scripts/                # Scripts d'automatisation
├── infrastructure/         # Docker & déploiement
├── tools/                  # Outils de développement
└── .github/               # CI/CD GitHub Actions
```

## 🚀 Démarrage rapide

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
npm install --legacy-peer-deps
```

### Lancement en développement
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
- **Carte interactive** Leaflet/OpenStreetMap
- **Formulaires** de prise de rendez-vous
- **Vérification** temps réel des codes

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