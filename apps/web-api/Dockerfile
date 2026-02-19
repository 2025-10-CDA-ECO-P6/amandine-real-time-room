# =========================
# ====== BUILD STAGE ======
# =========================
FROM node:20-alpine AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app
RUN corepack enable

# Workspace manifests
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web-api/package.json apps/web-api/package.json

# Install only what web-api needs (including dev deps for tsc)
RUN pnpm install --filter web-api... --frozen-lockfile

# Copy app sources and build
COPY apps/web-api apps/web-api
RUN pnpm --filter web-api build

# =========================
# ===== RUNTIME STAGE =====
# =========================
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Keep runtime small: only runtime artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web-api/dist ./dist
COPY --from=builder /app/apps/web-api/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/server.js"]
