# DarElKhair — Apartment Booking Platform: Build Plan

A feature-based build, executed **one feature at a time**. Each step is self-contained and testable before moving to the next. Tell me the step number (e.g. "do Phase 0" or "do Feature 1") and I'll build only that.

---

## Tech Stack (reference)

- **Frontend:** Next.js 15 (App Router), TypeScript, TailwindCSS, shadcn/ui, Radix
- **Backend:** NestJS, Prisma ORM, PostgreSQL
- **Auth:** JWT + refresh token rotation, RBAC
- **State:** Zustand · **Data fetching:** React Query
- **Architecture:** Modular monolith, **feature-based** (never layer-based)
- **Infra:** Docker + docker-compose
- **i18n:** French + Arabic (RTL) + English — integrated from the start
- **Localized content:** user-facing entity text (apartment title/description/city, etc.) is stored **per-locale as JSON** (`{ fr, ar, en }`), not single-language. Admin enters all 3 languages via tabbed forms; the public side renders the active locale with fallback.

---

## Phase 0 — Foundation & Scaffolding ⚙️

> Must come before any feature. Sets up the skeleton so every later feature drops cleanly into place.

- Monorepo layout: `apps/web` (Next.js) + `apps/api` (NestJS)
- Backend: NestJS app, `/modules` structure, Prisma init, base `PrismaModule`, config/env validation, global validation pipe, exception filters
- Frontend: Next.js 15 App Router, Tailwind + shadcn/ui init, `/features` structure, React Query provider, Zustand setup, base layout
- **i18n scaffolding:** next-intl (or equivalent), FR/AR/EN message files, RTL direction switching, locale routing
- **Design system primitives:** install the mandatory reusable components shells — `StatusBadge`, `DashboardCard`, `DataTable`, `FormWrapper`, `CalendarView`, `ApartmentCard`, `BookingCard`
- **Prisma schema baseline:** all core models stubbed — `User`, `Role`, `Apartment`, `ApartmentImage`, `AvailabilitySlot`, `Booking`, `BookingStatusHistory`, `Payment`, `Notification`, `AuditLog`
- **DevOps:** `Dockerfile` (web + api), `docker-compose.yml` (api, web, postgres), `.env.example`

---

## Feature 1 — Auth 🔐

- Backend `modules/auth`: register, login, refresh token rotation, logout, JWT guards, RBAC guard/decorator, password hashing
- DTOs + validation, `AuditLog` on auth events
- Frontend `features/auth`: login/register forms (`FormWrapper`), `api/`, `hooks/` (React Query), `store/` (Zustand auth/session), route protection middleware
- i18n strings (FR/AR/EN)

## Feature 2 — Users 👤

- Backend `modules/users`: CRUD, profile, role assignment, repository
- Frontend `features/users`: profile view/edit, admin user management table (`DataTable`)
- RBAC enforced (admin vs user)

## Feature 3 — Apartments 🏢

- **Multilingual content (decided):** translatable fields — `title`, `description`, `city`/`address` — stored as **localized JSON** `{ fr, ar, en }` (not `title_en/_fr/_ar` columns, not a separate table). Non-text fields (price, bedrooms, bathrooms, guests) stay normal columns. Adding a 4th language later = zero schema change.
  - Prisma: `title Json`, `description Json`, `city Json` on `Apartment`; a shared `LocalizedText` TS type mirrors `{ fr; ar; en }`.
  - Validation: DTO requires each text field to contain all 3 locales (configurable to allow FR-only + fallback).
  - Frontend helper: `localized(value, locale)` returns the active-locale string with fallback to the default locale — so switching language reflows instantly.
- Backend `modules/apartments`: CRUD, images relation, search/filter (filter/sort by translated text via Postgres `jsonb`)
- Frontend `features/apartments`: browse grid (`ApartmentCard`), detail page, **admin CRUD form with per-language tabs (FR / AR / EN)** for the translatable fields + a shared section for numeric fields
- Reusable `ApartmentCard` (renders via the `localized()` helper)

> The same localized-JSON pattern applies to any later entity with user-facing text (e.g. apartment amenities, payment instructions content).

## Feature 4 — Availability 📅

- Backend `modules/availability`: availability slots, date-range checks, conflict detection
- Frontend `features/availability`: `CalendarView`, availability checking on apartment detail, admin availability management

## Feature 5 — Bookings 🧾

- Backend `modules/bookings`: create booking, status machine (`PENDING → WAITING_PAYMENT → PROOF_SUBMITTED → CONFIRMED → CANCELLED`), `BookingStatusHistory`
- Frontend `features/bookings`: booking flow (select apartment → dates → availability → auth → create), `BookingCard`, status tracking, admin booking management
- `StatusBadge` for booking states

## Feature 6 — Payments 💳

- Backend `modules/payments`: offline payment records (bank transfer, mobile money, cash), admin verification flow
- Frontend `features/payments`: payment instructions page, payment method selection, admin validation UI
- WhatsApp support link

## Feature 7 — Uploads 📤

- Backend `modules/uploads`: secure file upload (payment proof images), validation, storage
- Frontend `features/uploads`: proof image upload UI, wired into the booking/payment flow

## Feature 8 — Notifications 🔔

- Backend `modules/notifications`: notification model events (booking status changes, payment validation)
- Frontend `features/notifications`: notification list/bell, mark-as-read

## Feature 9 — Dashboard 📊

- Backend: analytics aggregation endpoints
- Frontend `features/dashboard`: admin dashboard (Linear-style), `DashboardCard` metrics, bookings/payments overview, `DataTable` listings

---

## Cross-cutting (applied within each feature, not separate steps)

- Strict TypeScript (no `any`), DRY, SOLID, feature boundaries never crossed
- DTO validation on every endpoint
- Audit logging on sensitive mutations
- i18n strings added per feature (FR/AR/EN)
- **Localized entity content** uses the JSON `{ fr, ar, en }` pattern + the `localized()` helper; admin forms for translatable entities use per-language tabs
- shadcn/ui only — no custom UI libs, no duplicate components

---

## How to use this plan

Ask me for **one** step at a time, e.g.:

- "Do Phase 0"
- "Do Feature 1 (Auth)"

Each delivery includes: feature overview · backend module · frontend feature · Prisma changes · UI components · folder structure · how to run/test.
