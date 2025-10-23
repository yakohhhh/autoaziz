#!/bin/bash

echo "═══════════════════════════════════════════════════════════"
echo "🚀 LANCEMENT DU BACKEND AUTOSUR"
echo "═══════════════════════════════════════════════════════════"

# Vérifier si PostgreSQL est installé
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL n'est pas installé"
    echo "📦 Installation de PostgreSQL..."
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
fi

# Vérifier le statut de PostgreSQL
echo ""
echo "🔍 Vérification du statut de PostgreSQL..."
PG_STATUS=$(sudo systemctl is-active postgresql)

if [ "$PG_STATUS" != "active" ]; then
    echo "⚡ Démarrage de PostgreSQL..."
    sudo systemctl start postgresql
    sleep 2
    
    # Vérifier à nouveau
    if sudo systemctl is-active postgresql &> /dev/null; then
        echo "✅ PostgreSQL démarré avec succès"
    else
        echo "❌ Erreur lors du démarrage de PostgreSQL"
        exit 1
    fi
else
    echo "✅ PostgreSQL est déjà actif"
fi

# Afficher les informations de connexion
echo ""
echo "📊 Informations PostgreSQL:"
sudo -u postgres psql -c "SELECT version();" 2>/dev/null | head -3

# Vérifier si la base de données existe
echo ""
echo "🔍 Vérification de la base de données..."
DB_EXISTS=$(sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -w autoaziz | wc -l)

if [ $DB_EXISTS -eq 0 ]; then
    echo "⚠️  La base de données 'autoaziz' n'existe pas"
    echo "📝 Création de la base de données..."
    sudo -u postgres psql -c "CREATE DATABASE autoaziz;" 2>/dev/null
    sudo -u postgres psql -c "CREATE USER autoaziz_user WITH PASSWORD 'autoaziz_password';" 2>/dev/null
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE autoaziz TO autoaziz_user;" 2>/dev/null
    echo "✅ Base de données créée"
else
    echo "✅ Base de données 'autoaziz' existe déjà"
fi

# Vérifier les variables d'environnement
echo ""
echo "🔍 Vérification du fichier .env..."
cd /home/depop/delivery/part-time/autoaziz/apps/backend

if [ ! -f .env ]; then
    echo "⚠️  Fichier .env manquant"
    echo "📝 Création du fichier .env avec les valeurs par défaut..."
    cat > .env << 'EOF'
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=autoaziz_user
DB_PASSWORD=autoaziz_password
DB_DATABASE=autoaziz

# Server
PORT=3001

# JWT (à configurer plus tard)
JWT_SECRET=your-secret-key-change-this-in-production

# Email (à configurer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Twilio SMS (à configurer)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-phone-number
EOF
    echo "✅ Fichier .env créé"
else
    echo "✅ Fichier .env existe"
fi

# Lancer le backend
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🚀 Lancement du backend NestJS..."
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📦 Répertoire: $(pwd)"
echo "� Vérification du package.json..."

if [ ! -f package.json ]; then
    echo "❌ package.json introuvable"
    exit 1
fi

echo "✅ package.json trouvé"
echo ""
echo "🔥 Démarrage de NestJS en mode développement..."
echo ""

npm run start:dev