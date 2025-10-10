# Backend Dockerfile - Production optimisé
FROM node:18-alpine AS builder

# Installer les dépendances système
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Copier le code source
COPY src/ ./src/

# Build de l'application
RUN npm run build

# Stage de production
FROM node:18-alpine AS production

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S autoaziz -u 1001

WORKDIR /app

# Copier les dépendances depuis le builder
COPY --from=builder --chown=autoaziz:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=autoaziz:nodejs /app/dist ./dist
COPY --from=builder --chown=autoaziz:nodejs /app/package*.json ./

# Exposer le port
EXPOSE 3001

# Changer vers l'utilisateur non-root
USER autoaziz

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Démarrer l'application
CMD ["node", "dist/main"]