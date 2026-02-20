# -------------------------------
# Build stage
# -------------------------------
FROM node:lts-alpine AS build
WORKDIR /app

# Copier uniquement les fichiers nécessaires pour installer les dépendances
COPY ../../pnpm-lock.yaml ../../pnpm-workspace.yaml ../../package.json ./
COPY package.json ./package.json

# Activer corepack et installer PNPM
RUN corepack enable
RUN pnpm install --frozen-lockfile

# Copier le reste des sources du front
COPY . .

# Build de l'application front
RUN pnpm build

# -------------------------------
# Prod stage avec NGINX
# -------------------------------
FROM nginx:alpine AS production

# Supprimer la config par défaut
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copie config Nginx personnalisée
COPY web/nginx.conf /etc/nginx/templates/default.conf.template

# Copier les fichiers build React
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Démarre Nginx en premier plan pour que le conteneur reste actif
CMD ["nginx", "-g", "daemon off;"]