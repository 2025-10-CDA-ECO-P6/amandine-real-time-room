# -------------------------------
# Build stage
# -------------------------------
FROM node:lts-alpine AS build
WORKDIR /app

# Copier uniquement les fichiers nécessaires pour PNPM
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web-app/package.json ./apps/web-app/package.json

# Activer Corepack et installer les dépendances
RUN corepack enable
RUN pnpm install --frozen-lockfile

# Copier le reste des sources du front
COPY apps/web-app ./apps/web-app

# Build de l'application front
RUN pnpm --filter web-app build

# -------------------------------
# Prod stage avec NGINX
# -------------------------------
FROM nginx:alpine AS production

# Supprimer la config par défaut
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copier config Nginx personnalisée
COPY apps/web-app/nginx.conf /etc/nginx/templates/default.conf.template

# Copier les fichiers build React depuis l'étape de build
COPY --from=build /app/apps/web-app/dist /usr/share/nginx/html

EXPOSE 80

# Démarre Nginx en premier plan
CMD ["nginx", "-g", "daemon off;"]