# Guide de Déploiement - Auto Aziz

## Prérequis de Production

### Infrastructure Nécessaire
- Serveur Node.js (v16+)
- PostgreSQL Database (v12+)
- Serveur SMTP pour les emails
- Nom de domaine
- Certificat SSL/TLS

## Configuration Production

### 1. Backend (NestJS)

#### Variables d'Environnement
Créer un fichier `.env` avec les configurations de production :

```env
# Database
DB_HOST=your-postgres-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-password
DB_DATABASE=autoaziz_prod

# Email (utiliser un service professionnel comme SendGrid, AWS SES, etc.)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@company.com
SMTP_PASSWORD=your-email-password
SMTP_FROM=noreply@autoaziz.fr

# Application
PORT=3001
NODE_ENV=production
```

#### Build et Démarrage
```bash
cd backend
npm install --production
npm run build
npm run start:prod
```

#### Utilisation de PM2 (recommandé)
```bash
npm install -g pm2
cd backend
pm2 start dist/main.js --name autoaziz-api
pm2 save
pm2 startup
```

### 2. Frontend (React)

#### Build de Production
```bash
cd frontend
npm install
npm run build
```

Les fichiers statiques seront générés dans `frontend/build/`

#### Déploiement avec Nginx
Exemple de configuration Nginx :

```nginx
server {
    listen 80;
    server_name autoaziz.fr www.autoaziz.fr;
    
    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name autoaziz.fr www.autoaziz.fr;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Frontend
    location / {
        root /var/www/autoaziz/frontend/build;
        try_files $uri /index.html;
    }
    
    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /contacts {
        proxy_pass http://localhost:3001/contacts;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    
    location /appointments {
        proxy_pass http://localhost:3001/appointments;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### 3. Base de Données

#### Migration PostgreSQL
```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE autoaziz_prod;

# Les tables seront créées automatiquement au démarrage de l'application
# (synchronize: true dans la configuration TypeORM)
```

**Important** : En production, désactiver `synchronize: true` et utiliser des migrations :
```typescript
// Dans app.module.ts
TypeOrmModule.forRoot({
  // ...
  synchronize: false, // IMPORTANT : false en production
  migrations: ['dist/migrations/*.js'],
})
```

## Options de Déploiement

### Option 1 : Déploiement Traditionnel (VPS)
- Louer un VPS (DigitalOcean, OVH, AWS EC2, etc.)
- Installer Node.js, PostgreSQL, Nginx
- Configurer le firewall
- Installer un certificat SSL (Let's Encrypt)

### Option 2 : Docker (Recommandé)
Créer un `Dockerfile` pour le backend et le frontend, puis utiliser Docker Compose pour le déploiement.

### Option 3 : Services Cloud
- **Backend** : Heroku, Railway, Render, AWS Elastic Beanstalk
- **Frontend** : Vercel, Netlify, AWS S3 + CloudFront
- **Database** : AWS RDS, DigitalOcean Managed Database

## Sécurité

### Checklist de Sécurité
- [ ] Utiliser HTTPS partout
- [ ] Configurer CORS correctement (pas de `*`)
- [ ] Utiliser des mots de passe forts pour la base de données
- [ ] Ne jamais commiter les fichiers `.env`
- [ ] Activer les limites de taux (rate limiting)
- [ ] Valider toutes les entrées utilisateur
- [ ] Utiliser des en-têtes de sécurité (Helmet.js)
- [ ] Sauvegarder régulièrement la base de données
- [ ] Surveiller les logs d'erreur

## Monitoring

### Outils Recommandés
- **Application** : PM2, New Relic, DataDog
- **Logs** : Winston, Loggly, Papertrail
- **Uptime** : UptimeRobot, Pingdom
- **Errors** : Sentry

## Maintenance

### Sauvegardes PostgreSQL
```bash
# Backup quotidien
pg_dump -U postgres autoaziz_prod > backup_$(date +%Y%m%d).sql

# Restauration
psql -U postgres autoaziz_prod < backup_20240101.sql
```

### Mise à Jour
```bash
# Backend
cd backend
git pull
npm install
npm run build
pm2 restart autoaziz-api

# Frontend
cd frontend
git pull
npm install
npm run build
# Copier les fichiers vers le serveur web
```

## Coûts Estimés (mensuel)

- **VPS** : 10-50€/mois
- **Base de données** : Inclus ou 10-30€/mois
- **Nom de domaine** : 10-20€/an
- **Email** : 0-10€/mois (selon le volume)
- **SSL** : Gratuit (Let's Encrypt)

**Total estimé** : 20-100€/mois selon les options choisies
