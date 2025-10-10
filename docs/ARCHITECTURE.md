# 🏗️ Architecture Auto Aziz - Guide de structure

## 📁 Structure du projet

```
autoaziz/
├── apps/                    # 🚀 Applications principales
│   ├── backend/            # 🔧 API NestJS + TypeORM + PostgreSQL
│   ├── frontend/           # 🎨 React + TypeScript + Leaflet
│   └── database/           # 🗄️ Migrations et configuration DB
├── docs/                   # 📚 Documentation complète
│   ├── README.md           # Documentation principale
│   ├── DEPLOYMENT.md       # Guide de déploiement
│   ├── ESLINT_SETUP.md     # Configuration qualité code
│   └── ...                 # Guides spécialisés
├── scripts/                # 🛠️ Scripts d'automatisation
│   ├── install.sh          # Installation complète
│   ├── deploy.sh           # Déploiement
│   ├── lint.sh             # Linting global
│   └── ...                 # Utilitaires développement
├── infrastructure/         # 🐳 Déploiement et infra
│   ├── docker-compose.yml  # Environnement développement
│   └── docker-compose.prod.yml # Production
├── tools/                  # 🔧 Outils de développement
│   ├── .editorconfig       # Configuration éditeur
│   └── .vscode/            # Configuration VS Code
├── .github/               # ⚙️ CI/CD et automatisation
│   └── workflows/          # GitHub Actions
├── .gitignore             # 🚫 Fichiers ignorés
└── README.md              # 📖 Guide principal
```

## 🎯 Principes d'organisation

### 1. **Séparation des responsabilités**
- **`apps/`** : Code métier et applications
- **`docs/`** : Documentation et guides
- **`scripts/`** : Automatisation et utilitaires
- **`infrastructure/`** : Déploiement et configuration
- **`tools/`** : Outils de développement

### 2. **Applications (`apps/`)**
Structure monorepo avec applications séparées :
- **Backend** : API autonome avec sa propre configuration
- **Frontend** : SPA indépendante avec son build
- **Database** : Migrations et schémas centralisés

### 3. **Documentation (`docs/`)**
Documentation centralisée et organisée :
- Guides techniques spécialisés
- Documentation API et composants
- Guides de déploiement et troubleshooting

### 4. **Scripts (`scripts/`)**
Automatisation du workflow de développement :
- Installation et configuration
- Tests et validation
- Déploiement et monitoring

## 🔄 Workflow de développement

### Développement local
```bash
# Installation
./scripts/install.sh

# Développement backend
cd apps/backend && npm run start:dev

# Développement frontend  
cd apps/frontend && npm start

# Linting global
./scripts/lint.sh
```

### Tests et validation
```bash
# Tests complets
./scripts/validate-push.sh

# Tests spécifiques
cd apps/backend && npm test
cd apps/frontend && npm test
```

### Déploiement
```bash
# Développement
docker-compose -f infrastructure/docker-compose.yml up

# Production
./scripts/deploy-production.sh
```

## 📋 Avantages de cette architecture

### ✅ **Organisation claire**
- Structure logique et prévisible
- Séparation des préoccupations
- Navigation intuitive

### ✅ **Maintenance facilitée**
- Localisation rapide des fichiers
- Documentation centralisée
- Scripts réutilisables

### ✅ **Scalabilité**
- Ajout facile de nouvelles applications
- Extension simple de la documentation
- Scripts modulaires

### ✅ **Collaboration**
- Structure standardisée pour l'équipe
- Documentation accessible
- Outils partagés

## 🔧 Migration depuis l'ancienne structure

Les principaux changements :
- `backend/` → `apps/backend/`
- `frontend/` → `apps/frontend/`
- `*.md` → `docs/`
- `*.sh` → `scripts/`
- `docker-compose.yml` → `infrastructure/`

## 📝 Bonnes pratiques

### Ajout de nouvelles fonctionnalités
1. **Code** : dans `apps/[application]/`
2. **Documentation** : dans `docs/`
3. **Scripts** : dans `scripts/`
4. **Configuration** : dans `tools/` ou `infrastructure/`

### Maintenance
- Garder la documentation à jour
- Tester les scripts régulièrement
- Versionner les changements d'infrastructure
- Documenter les décisions architecturales

---

**Cette architecture favorise la maintenabilité, la scalabilité et la collaboration** 🚀