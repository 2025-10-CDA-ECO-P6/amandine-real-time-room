FROM node:lts-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app
RUN corepack enable

# Build stage
FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web-api/package.json apps/web-api/package.json
RUN pnpm install --filter web-api --frozen-lockfile
COPY apps/web-api apps/web-api
WORKDIR /app/apps/web-api
RUN pnpm run build

# Prod stage
FROM node:lts-alpine AS production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web-api/package.json apps/web-api/package.json
RUN pnpm install --filter web-api --prod --frozen-lockfile
COPY --from=build /app/apps/web-api/dist ./dist
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/server.js"]
