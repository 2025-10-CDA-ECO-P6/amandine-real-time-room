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
FROM nginx:alpine

# Copier le build React
COPY --from=build /app/dist /usr/share/nginx/html

# Copier le template NGINX
COPY nginx.conf /etc/nginx/templates/nginx.conf.template

EXPOSE 80

# Substitution de la variable et lancement NGINX
CMD envsubst '$API_URL' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf \
    && nginx -g 'daemon off;'