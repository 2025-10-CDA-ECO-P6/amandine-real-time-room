FROM node:24-alpine AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app
RUN corepack enable

# Cache-friendly layer: install deps from workspace manifests first.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web-api/package.json apps/web-api/package.json
RUN pnpm install --filter api... --frozen-lockfile

# Copy sources and build TypeScript.
COPY apps/web-api apps/web-api
RUN pnpm --filter api build

FROM node:24-alpine AS runtime
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production

WORKDIR /app
RUN corepack enable

# Install only production dependencies for web-api.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web-api/package.json apps/web-api/package.json
RUN pnpm install --filter api... --prod --frozen-lockfile

# Copy compiled output from builder stage.
COPY --from=builder /app/apps/web-api/dist ./apps/web-api/dist

WORKDIR /app/apps/web-api
EXPOSE 3000
CMD ["node", "dist/server.js"]
