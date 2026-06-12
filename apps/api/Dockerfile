# syntax=docker/dockerfile:1.7

FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# ---- deps (cached as long as lockfile + manifests are unchanged) ----
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages ./packages
RUN pnpm install --frozen-lockfile

# ---- build ----
COPY apps/api ./apps/api
WORKDIR /app/apps/api
RUN pnpm prisma generate
RUN pnpm build

ENV NODE_ENV=production
# Railway injects PORT; falls back to 3001 elsewhere.
EXPOSE 3000

# Apply pending migrations, then start the API. Safe to re-run (no-op when up-to-date).
CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/main"]