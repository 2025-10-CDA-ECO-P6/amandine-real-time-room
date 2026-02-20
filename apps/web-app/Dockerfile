# -------------------------------
# Build stage
# -------------------------------
FROM node:lts-alpine AS build
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY package.json apps/web-app/package.json
RUN corepack enable && pnpm install \

COPY . .

RUN pnpm build

# -------------------------------
# Prod stage avec NGINX
# -------------------------------
FROM nginx:alpine

# Copie du build React
COPY --from=build /app/apps/web-app/dist /usr/share/nginx/html

# Copie du template NGINX
COPY apps/web-app/nginx.conf /etc/nginx/templates/nginx.conf.template

# Valeur par défaut pour dev local
ENV API_URL=http://localhost:3030

# Substitution de la variable et lancement NGINX
CMD envsubst '$API_URL' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf \
    && nginx -g 'daemon off;'