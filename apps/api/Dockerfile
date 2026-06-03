# ── DarElKhair API (NestJS) ──────────────────────────────────────
# Built from the repo root so the pnpm workspace is available.
#   docker build -f apps/api/Dockerfile .

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# ── deps: install workspace deps with the api filter ──
FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
RUN pnpm install --filter @darelkhair/api... --frozen-lockfile=false

# ── build: generate Prisma client + compile ──
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY package.json pnpm-workspace.yaml ./
COPY apps/api ./apps/api
WORKDIR /app/apps/api
RUN pnpm prisma generate
RUN pnpm build

# ── runtime ──
FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
WORKDIR /app/apps/api
EXPOSE 4000
# Apply migrations then start. (Override in compose if you prefer manual migrate.)
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node dist/main.js"]
