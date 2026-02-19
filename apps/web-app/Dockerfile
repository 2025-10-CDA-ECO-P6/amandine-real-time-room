# ----------------------
# Build stage
# ----------------------
FROM node:lts-alpine AS build

WORKDIR /app

# Copier uniquement les fichiers nécessaires pour installer les dépendances
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web-app/package.json ./apps/web-app/package.json

# Activer Corepack et installer pnpm
RUN corepack enable

# Installer toutes les dépendances du workspace (avec filtre sur web-app)
RUN pnpm install --filter web-app... --frozen-lockfile

# Copier le reste du code après l'installation pour profiter du cache Docker
COPY . .

# Construire uniquement le package web-app
RUN pnpm --filter web-app build

# ----------------------
# Production stage
# ----------------------
FROM nginx:alpine AS prod

# Copier le build final de web-app
COPY --from=build /app/apps/web-app/dist /usr/share/nginx/html

# Exposer le port
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
