# 🚗 Auto Aziz - Système Professionnel de Gestion de Rendez-vous

[![CI/CD Pipeline](https://github.com/votre-username/autoaziz/workflows/🚀%20Auto%20Aziz%20CI/CD%20Pipeline/badge.svg)](https://github.com/votre-username/autoaziz/actions)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Système complet de gestion de rendez-vous pour garage automobile avec vérification par email/SMS, architecture Docker, CI/CD automatisé et déploiement professionnel.**

## 📋 Table des Matières

- [🌟 Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture](#️-architecture)
- [⚡ Installation Rapide](#-installation-rapide)
- [🐳 Docker](#-docker)
- [🚀 Déploiement](#-déploiement)
- [🔧 Configuration](#-configuration)
- [📖 Documentation](#-documentation)
- [🤝 Contribution](#-contribution)

## 🌟 Fonctionnalités

### ✨ **Système de Rendez-vous Avancé**
- 📅 **Prise de rendez-vous en ligne** avec formulaire intelligent
- 🔐 **Vérification double** par email ET SMS
- ✅ **Confirmation automatique** après vérification
- 📧 **Emails professionnels** avec templates personnalisés
- 📱 **SMS de vérification** (intégration Twilio ready)

### 🛡️ **Sécurité & Qualité**
- 🔒 **Authentification sécurisée** avec JWT
- 🛡️ **Validation des données** complète
- 🔐 **Codes de vérification** avec expiration
- 📊 **Logs détaillés** pour audit
- 🚨 **Monitoring** temps réel

### 🏗️ **Architecture Professionnelle**
- 🐳 **Docker** pour tous les environnements
- 🔄 **CI/CD** automatisé avec GitHub Actions
- 📦 **Déploiement** zéro-downtime
- 🎯 **Webhooks** GitHub pour déploiement auto
- 📈 **Monitoring** avec Grafana & Prometheus

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React.js      │    │    NestJS       │    │  PostgreSQL     │
│   Frontend      │◄──►│    Backend      │◄──►│   Database      │
│   (Port 3000)   │    │   (Port 3001)   │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                       │                       │
          ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Docker Network                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Nginx     │  │    Redis    │  │      Monitoring         │ │
│  │ Reverse     │  │   Cache     │  │   (Grafana/Prometheus)  │ │
│  │   Proxy     │  │             │  │                         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 🛠️ **Stack Technique**

**Backend (NestJS)**
- TypeScript
- PostgreSQL avec TypeORM
- Redis pour le cache
- Nodemailer pour les emails
- JWT pour l'authentification
- Swagger pour la documentation API

**Frontend (React)**
- TypeScript
- React Router
- CSS Modules
- Responsive Design
- Progressive Web App ready

**Infrastructure**
- Docker & Docker Compose
- Nginx reverse proxy
- Let's Encrypt SSL
- GitHub Actions CI/CD
- Webhooks automatisés

## ⚡ Installation Rapide

### 🚀 **Installation Automatique (Recommandée)**

```bash
# Cloner le projet
git clone https://github.com/votre-username/autoaziz.git
cd autoaziz

# Lancer l'installation automatique
chmod +x install.sh
./install.sh

# Démarrer en développement
npm run dev
```

### 🛠️ **Installation Manuelle**

```bash
# Prérequis : Node.js 18+, Docker, Docker Compose

# Backend
cd backend
npm install
cp .env.example .env
# Configurez vos variables dans .env

# Frontend
cd ../frontend
npm install

# Base de données
docker-compose up -d postgres

# Démarrage
npm run dev  # Depuis la racine
```

## 🐳 Docker

### **Développement**
```bash
# Démarrer tous les services
docker-compose up

# Rebuilder les images
docker-compose up --build

# Logs des services
docker-compose logs -f
```

### **Production**
```bash
# Déploiement production
docker-compose -f docker-compose.prod.yml up -d

# Monitoring
docker-compose -f docker-compose.prod.yml logs -f

# Mise à jour
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## 🚀 Déploiement

### **🏗️ Configuration Serveur**

```bash
# Installation serveur Ubuntu/Debian
chmod +x server-setup.sh
sudo ./server-setup.sh votre-domaine.com admin@votre-domaine.com
```

**Ce script configure automatiquement :**
- ✅ Docker & Docker Compose
- ✅ Nginx avec SSL (Let's Encrypt)
- ✅ Firewall (UFW)
- ✅ Fail2Ban
- ✅ Service webhook GitHub
- ✅ Monitoring Netdata
- ✅ Rotation des logs
- ✅ Tâches cron

### **🔄 CI/CD avec GitHub Actions**

Le pipeline CI/CD s'exécute automatiquement sur :
- **Push sur `main`** → Tests + Build + Déploiement
- **Pull Requests** → Tests + Vérifications
- **Release** → Déploiement production

**Configuration requise :**
```yaml
# Secrets GitHub à configurer
GITHUB_TOKEN: ghp_xxx...
SSH_PRIVATE_KEY: -----BEGIN OPENSSH PRIVATE KEY-----
HOST: votre-serveur.com
USERNAME: autoaziz
SLACK_WEBHOOK: https://hooks.slack.com/...
```

### **🎯 Webhook GitHub**

```bash
# Démarrer le serveur webhook
node webhook-server.js

# Ou avec systemd
sudo systemctl start autoaziz-webhook
sudo systemctl enable autoaziz-webhook
```

**URL webhook GitHub :** `https://votre-domaine.com:9000/webhook`

## 🔧 Configuration

### **📧 Configuration Email (Gmail)**

```env
# .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre_app_password_16_caracteres
SMTP_FROM=noreply@votre-domaine.com
```

**Génération App Password Gmail :**
1. Activer l'authentification à 2 facteurs
2. Aller dans Paramètres → Sécurité → Mots de passe d'application
3. Générer un mot de passe pour "Mail"

### **📱 Configuration SMS (Twilio)**

```env
# .env (optionnel)
TWILIO_ACCOUNT_SID=ACxxx...
TWILIO_AUTH_TOKEN=xxx...
TWILIO_PHONE_NUMBER=+33123456789
```

### **🔐 Configuration Base de Données**

```env
# .env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=mot_de_passe_fort
DB_DATABASE=autoaziz
```

## 📖 Documentation

### **📚 Guides Détaillés**
- [🔐 VERIFICATION_SYSTEM_GUIDE.md](VERIFICATION_SYSTEM_GUIDE.md) - Système de vérification
- [📧 GMAIL_FIX_GUIDE.md](GMAIL_FIX_GUIDE.md) - Configuration Gmail
- [🚀 DEPLOYMENT.md](DEPLOYMENT.md) - Guide de déploiement

### **🔗 APIs & Endpoints**

**Documentation Swagger :** `http://localhost:3001/api`

**Endpoints principaux :**
```
POST /appointments        - Créer un rendez-vous
POST /appointments/verify - Vérifier un code
GET  /appointments        - Liste des rendez-vous
POST /contacts           - Formulaire de contact
```

### **🧪 Tests**

```bash
# Tests backend
cd backend && npm test

# Tests frontend
cd frontend && npm test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🔍 Scripts Disponibles

```bash
# Développement
npm run dev              # Démarrer frontend + backend
npm run dev:backend      # Backend seulement
npm run dev:frontend     # Frontend seulement

# Build
npm run build            # Build complet
npm run build:backend    # Build backend
npm run build:frontend   # Build frontend

# Tests
npm run test             # Tous les tests
npm run test:backend     # Tests backend
npm run test:frontend    # Tests frontend

# Docker
npm run docker:dev       # Docker développement
npm run docker:prod      # Docker production

# Utilitaires
npm run clean            # Nettoyer node_modules
npm run reset            # Reset + réinstall
npm run lint             # Linting complet
```

## 🤝 Contribution

### **🔄 Workflow Git**

```bash
# Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# Commits
git add .
git commit -m "feat: ajouter vérification SMS"

# Push et PR
git push origin feature/nouvelle-fonctionnalite
# Créer une Pull Request sur GitHub
```

### **📋 Standards de Code**

- ✅ **ESLint** pour la qualité du code
- ✅ **Prettier** pour le formatage
- ✅ **Conventional Commits** pour les messages
- ✅ **Tests** obligatoires pour les nouvelles fonctionnalités
- ✅ **Documentation** à jour

### **🎯 Roadmap**

- [ ] **Authentification utilisateur** avancée
- [ ] **Dashboard admin** complet
- [ ] **API mobile** native
- [ ] **Intégration calendrier** Google/Outlook
- [ ] **Notifications push** PWA
- [ ] **Multi-garage** support
- [ ] **Facturation** automatique

## 📞 Support & Contact

- 📧 **Email :** support@autoaziz.com
- 🐛 **Issues :** [GitHub Issues](https://github.com/votre-username/autoaziz/issues)
- 📖 **Documentation :** [Wiki](https://github.com/votre-username/autoaziz/wiki)
- 💬 **Discord :** [Serveur Auto Aziz](https://discord.gg/autoaziz)

## 📜 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">

**🚗 Auto Aziz - Le futur de la gestion de rendez-vous automobile**

[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/votre-username/autoaziz)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://docker.com)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org)

</div>