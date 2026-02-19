# =========================
# ====== BUILD STAGE ======
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Activer corepack et pnpm
RUN corepack enable && corepack prepare pnpm@10.22.0 --activate

# Copier package.json et lockfile
COPY apps/web-api/package.json apps/web-api/pnpm-lock.yaml ./

# Copier tout le projet de l'app
COPY apps/web-api/ ./

# Installer les dépendances
RUN pnpm install --frozen-lockfile

# Compiler TypeScript
RUN pnpm exec tsc

# =========================
# ===== RUNTIME STAGE ======
# =========================
FROM node:20-alpine

WORKDIR /app

# Activer pnpm (utile si besoin de scripts)
RUN corepack enable

# Copier node_modules du builder
COPY --from=builder /app/node_modules ./node_modules

# Copier le build compilé
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Exposer le port de l'API
EXPOSE 3000

# Lancer le serveur Node
CMD ["node", "dist/server.js"]
