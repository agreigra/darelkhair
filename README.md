# DarElKhair — Apartment Booking Platform

Production-ready apartment booking platform. **Feature-based** modular monolith.

- **Frontend:** Next.js 15 (App Router), TypeScript, TailwindCSS, shadcn/ui — `apps/web`
- **Backend:** NestJS, Prisma, PostgreSQL — `apps/api`
- **i18n:** French (default) · Arabic (RTL) · English
- **Auth:** JWT + refresh rotation, RBAC, email-based password reset (built in Feature 1)

See [BUILD_PLAN.md](./BUILD_PLAN.md) for the feature-by-feature roadmap.

## Email & password reset

Forgot/reset password is an email-based flow: a user requests a reset at
`/forgot-password`, receives a single-use, 1-hour link, and sets a new password
at `/reset-password` (which also revokes existing sessions).

Email is sent over SMTP. Configure it via the `SMTP_*`, `MAIL_FROM`, and
`WEB_APP_URL` vars in `.env` (see [.env.example](./.env.example)). If `SMTP_HOST`
is left empty the mailer runs in **log mode** — the reset link is printed to the
API console instead of being sent, so local dev works with no mail server.

## Prerequisites

- Node ≥ 20, pnpm ≥ 9
- Docker (for PostgreSQL)

## Getting started (local dev)

```bash
# 1. Install dependencies (workspace root)
pnpm install

# 2. Create your env file
cp .env.example .env

# 3. Start PostgreSQL
docker compose up -d postgres

# 4. Generate the Prisma client + run the first migration
pnpm --filter @darelkhair/api prisma:generate
pnpm --filter @darelkhair/api prisma:migrate   # creates the baseline tables

# 5. Run both apps (web :3000, api :4000)
pnpm dev
```

- Web: http://localhost:3000 (redirects to `/fr`)
- API health: http://localhost:4000/api/health

## Full stack in Docker

```bash
cp .env.example .env
docker compose up --build
```

## Repo layout

```
darelkhair/
├── apps/
│   ├── api/        # NestJS — src/modules/<feature> per feature
│   └── web/        # Next.js — src/features/<feature> per feature
├── docker-compose.yml
├── .env.example
└── BUILD_PLAN.md
```

## Useful scripts (root)

| Command           | Description                 |
| ----------------- | --------------------------- |
| `pnpm dev`        | Run web + api in watch mode |
| `pnpm build`      | Build both apps             |
| `pnpm typecheck`  | Typecheck both apps         |
| `pnpm lint`       | Lint both apps              |
| `pnpm db:migrate` | Run Prisma migrations (api) |
| `pnpm docker:up`  | Start the full stack        |
