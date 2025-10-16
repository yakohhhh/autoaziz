#!/bin/bash

# 🚗 Auto Aziz - Configuration des hooks Git
# Description: Configuration automatique des hooks Git pour la qualité du code

set -e

echo "🔧 Configuration des hooks Git pour Auto Aziz..."

# ===============================================
# 📁 Création du dossier hooks
# ===============================================
mkdir -p .git/hooks

# ===============================================
# 🛡️ Hook pre-commit
# ===============================================
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "🔍 Exécution des vérifications pre-commit..."

# Vérification des fichiers stagés
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx)$' || true)

if [ -z "$STAGED_FILES" ]; then
    echo "✅ Aucun fichier TypeScript/JavaScript à vérifier"
    exit 0
fi

echo "📝 Fichiers à vérifier:"
echo "$STAGED_FILES"

# Vérification ESLint
echo "🔍 Vérification ESLint..."
./lint.sh --backend --fix || {
    echo "❌ Erreurs ESLint backend non corrigées."
    exit 1
}

./lint.sh --frontend --fix || {
    echo "❌ Erreurs ESLint frontend non corrigées."
    exit 1
}

# Vérification TypeScript
echo "🔍 Vérification TypeScript..."
cd apps/backend
npm run build || {
    echo "❌ Erreurs de compilation TypeScript détectées."
    exit 1
}
cd ../..

cd apps/frontend
npm run build || {
    echo "❌ Erreurs de compilation TypeScript détectées dans le frontend."
    exit 1
}
cd ../..

# Tests
echo "🧪 Exécution des tests..."
cd apps/backend
npm run test || {
    echo "❌ Tests échoués."
    exit 1
}
cd ../..

echo "✅ Toutes les vérifications sont passées!"
EOF

# ===============================================
# 📨 Hook commit-msg
# ===============================================
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash

commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,50}'

error_msg="❌ Format de commit invalide!
📝 Utilisez le format: <type>(<scope>): <description>

Types autorisés:
  feat:     Nouvelle fonctionnalité
  fix:      Correction de bug
  docs:     Documentation
  style:    Formatage, point-virgules manquants, etc.
  refactor: Refactoring du code
  test:     Ajout de tests
  chore:    Maintenance
  perf:     Amélioration des performances
  ci:       Intégration continue
  build:    Système de build
  revert:   Annulation d'un commit

Exemples:
  feat(auth): ajouter vérification SMS
  fix(email): corriger l'envoi des emails
  docs: mettre à jour le README"

if ! grep -qE "$commit_regex" "$1"; then
    echo "$error_msg" >&2
    exit 1
fi
EOF

# ===============================================
# 🚀 Hook pre-push
# ===============================================
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

echo "🚀 Vérifications avant push..."

# Tests d'intégration
echo "🧪 Exécution des tests d'intégration..."
cd apps/backend
npm run test:e2e || {
    echo "❌ Tests d'intégration échoués."
    exit 1
}
cd ../..

# Vérification de sécurité
echo "🔒 Audit de sécurité..."
cd apps/backend
npm audit --audit-level moderate || {
    echo "⚠️  Vulnérabilités de sécurité détectées. Exécutez 'npm audit fix'."
    exit 1
}
cd ..

cd ../frontend
npm audit --audit-level moderate || {
    echo "⚠️  Vulnérabilités de sécurité détectées dans le frontend."
    exit 1
}
cd ../..

echo "✅ Prêt pour le push!"
EOF

# ===============================================
# 🔑 Rendre les hooks exécutables
# ===============================================
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/commit-msg
chmod +x .git/hooks/pre-push

echo "✅ Hooks Git configurés avec succès!"
echo ""
echo "📋 Hooks installés:"
echo "  • pre-commit: Vérification du code et tests"
echo "  • commit-msg: Validation du format des messages"
echo "  • pre-push: Tests d'intégration et audit de sécurité"
echo ""
echo "💡 Pour contourner temporairement les hooks:"
echo "  git commit --no-verify"
echo "  git push --no-verify"