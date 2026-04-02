# Utilisation de la version Node alpine comme base pour la build
FROM node:22-alpine AS builder

WORKDIR /app

# Prise en charge des variables d'environnement Next.js au build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copier les fichiers de dépendances et installer
COPY package*.json ./
RUN npm ci

# Copier tout le reste et construire le projet Next.js
COPY . .
RUN npm run build

# ----- Image finale -----
FROM node:22-alpine

WORKDIR /app

# Installer seulement les prod dependencies pour exécution
COPY package*.json ./
RUN npm ci --omit=dev

# Copier l'app buildée depuis l'étape builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Utiliser la commande officielle Next.js pour le démarrage
CMD ["npx", "next", "start"]