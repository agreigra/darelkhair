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

## Phase 0 — Foundation & Scaffolding ⚙️ ✅ DONE

> Must come before any feature. Sets up the skeleton so every later feature drops cleanly into place.

- Monorepo layout: `apps/web` (Next.js) + `apps/api` (NestJS)
- Backend: NestJS app, `/modules` structure, Prisma init, base `PrismaModule`, config/env validation, global validation pipe, exception filters
- Frontend: Next.js 15 App Router, Tailwind + shadcn/ui init, `/features` structure, React Query provider, Zustand setup, base layout
- **i18n scaffolding:** next-intl (or equivalent), FR/AR/EN message files, RTL direction switching, locale routing
- **Design system primitives:** install the mandatory reusable components shells — `StatusBadge`, `DashboardCard`, `DataTable`, `FormWrapper`, `CalendarView`, `ApartmentCard`, `BookingCard`
- **Prisma schema baseline:** all core models stubbed — `User`, `Role`, `Apartment`, `ApartmentImage`, `AvailabilitySlot`, `Booking`, `BookingStatusHistory`, `Payment`, `Notification`, `AuditLog`
- **DevOps:** `Dockerfile` (web + api), `docker-compose.yml` (api, web, postgres), `.env.example`

---

## Feature 1 — Auth 🔐 ✅ DONE

- Backend `modules/auth`: register, login, refresh token rotation (+reuse detection), logout, JWT guards, RBAC guard/decorator, bcrypt hashing
- DTOs + validation, `AuditLog` on auth events (via global `AuditModule`)
- Access token in memory + refresh token as httpOnly cookie; global `JwtAuthGuard` (secure-by-default, `@Public()` opt-out) + `RolesGuard`
- Frontend `features/auth`: login/register forms (`FormWrapper` + shadcn `Form`), `api/`, `hooks/` (React Query), `store/` (Zustand), silent-refresh axios interceptor, `AuthProvider`, auth-aware header, route-protection middleware
- i18n strings (FR/AR/EN), design system applied from darelkhair.xyz (teal/orange/gold, Inter + Noto Sans Arabic)

## Feature 2 — Users 👤 ✅ DONE

- Backend `modules/users`: self profile (get/update), change password, admin CRUD (list+search+pagination, get, role/status update, delete) with lockout guards + audit logs; `@Roles(ADMIN)` RBAC
- Frontend `features/users`: `/account` (profile + password forms), `/admin/users` (search, role filter, pagination, row actions via dropdown, delete confirm) using `DataTable`
- Shared UI added: shadcn `dropdown-menu`, `avatar`, `dialog`, `ConfirmDialog`, `PageHeader`; auth-aware header user menu; `AdminGuard` + `/admin` route protection
- Seed: `admin@darelkhair.xyz / Admin12345`, `user@darelkhair.xyz / User12345` (+5 guests). i18n FR/AR/EN

## Feature 3 — Apartments 🏢 ✅ DONE

> Built: localized-JSON `{fr,ar,en}` content with jsonb cross-locale search; public browse (`/apartments`) + detail (`/apartments/[id]`); admin CRUD (`/admin/apartments`) with the per-language tabbed `LocalizedField` form, publish switch, and image manager; `ApartmentCard` renders via `localized()`; 6 seeded apartments. Decimal price → number in the API. Shared UI added: `tabs`, `switch`, `textarea`.
> **Image uploads → Cloudflare R2:** reusable global `StorageModule` (R2 via the S3 API + local-disk fallback chosen by `STORAGE_DRIVER`); multipart upload endpoint with type/size validation + RBAC; `ApartmentImage.storageKey` persisted so objects are deleted from storage on remove; drag-&-drop upload UI. Set `STORAGE_DRIVER=r2` + the `R2_*` env vars for production (add the r2.dev/custom host to `next.config`).

- **Multilingual content (decided):** translatable fields — `title`, `description`, `city`/`address` — stored as **localized JSON** `{ fr, ar, en }` (not `title_en/_fr/_ar` columns, not a separate table). Non-text fields (price, bedrooms, bathrooms, guests) stay normal columns. Adding a 4th language later = zero schema change.
  - Prisma: `title Json`, `description Json`, `city Json` on `Apartment`; a shared `LocalizedText` TS type mirrors `{ fr; ar; en }`.
  - Validation: DTO requires each text field to contain all 3 locales (configurable to allow FR-only + fallback).
  - Frontend helper: `localized(value, locale)` returns the active-locale string with fallback to the default locale — so switching language reflows instantly.
- Backend `modules/apartments`: CRUD, images relation, search/filter (filter/sort by translated text via Postgres `jsonb`)
- Frontend `features/apartments`: browse grid (`ApartmentCard`), detail page, **admin CRUD form with per-language tabs (FR / AR / EN)** for the translatable fields + a shared section for numeric fields
- Reusable `ApartmentCard` (renders via the `localized()` helper)

> The same localized-JSON pattern applies to any later entity with user-facing text (e.g. apartment amenities, payment instructions content).

## Feature 4 — Availability 📅 ✅ DONE

> Built: admin **blocked date ranges** + active-booking conflicts. Public `GET /apartments/:id/availability` (unavailable ranges for the calendar) + `/availability/check` (stay overlap, half-open checkout); admin block/list/delete (`@Roles(ADMIN)`, audited). Dates exchanged as **YYYY-MM-DD** (no TZ drift) via date utils on both sides. Frontend: `AvailabilityCalendar` (range picker on `CalendarView`, disables unavailable+past, shows nights/total/availability — feeds Feature 5 via `onRangeChange`) on the apartment detail; `AdminAvailabilityManager` (block dates + list) on the edit page. The `/availability/check` endpoint is the hook Feature 5's booking flow validates against.

- Backend `modules/availability`: availability slots, date-range checks, conflict detection
- Frontend `features/availability`: `CalendarView`, availability checking on apartment detail, admin availability management

## Feature 5 — Bookings 🧾 ✅ DONE

> Built: guest booking flow + admin management on a server-enforced **status machine** (`PENDING → WAITING_PAYMENT → PROOF_SUBMITTED → CONFIRMED`, `CANCELLED` terminal; illegal jumps → 400). Backend `modules/bookings`: create validates published apartment, guest count ≤ max, no past dates, and **reuses Feature 4's `availability.check`** (409 on overlap); `totalPrice` computed server-side (nights × price); every transition appends an atomic `BookingStatusHistory` row (nested write). Guest routes are own-bookings-only (404 on others); admin routes `@Roles(ADMIN)` with search by reference/email + status filter; audit logs on create + status change. Frontend `features/bookings`: `BookingPanel` on the apartment detail (dates via the availability calendar → guests → auth-gated create, anon users routed to login + back), `/bookings` list (`BookingCard`, status chips) + `/bookings/[id]` (status timeline + self-cancel), `/admin/bookings` (`DataTable`) + `/admin/bookings/[id]` (guest info, transition controls mirroring the machine). `StatusBadge` everywhere; nav links added. Verified: typecheck + build both apps; ICU plurals valid in all 3 locales; lifecycle smoke (create→advance→confirm→cancel), overlap 409, guest/past/RBAC 400/401/403, date release on cancel, 1500 = 3×500 pricing.

- Backend `modules/bookings`: create booking, status machine (`PENDING → WAITING_PAYMENT → PROOF_SUBMITTED → CONFIRMED → CANCELLED`), `BookingStatusHistory`
- Frontend `features/bookings`: booking flow (select apartment → dates → availability → auth → create), `BookingCard`, status tracking, admin booking management
- `StatusBadge` for booking states

## Feature 6 — Payments 💳 ✅ DONE

> Built: **offline payment** with **proof-of-payment image upload** (no automatic gateway — Mauritania use-case). Flow: booking is created straight into **`WAITING_PAYMENT`** (no admin-approval step) → guest picks a method on the booking page, follows that method's instructions, then either **uploads a screenshot** (bank transfer / mobile money → booking `PROOF_SUBMITTED`) or chooses **cash** (no proof → stays `WAITING_PAYMENT`, settled on arrival). Admin `verify` → booking `CONFIRMED` (from `PROOF_SUBMITTED` for proof, or directly from `WAITING_PAYMENT` for cash); `reject` (with note) → back to `WAITING_PAYMENT` so the guest can resubmit. Backend `modules/payments`: multipart `POST /bookings/:id/payment` (owner-only, `WAITING_PAYMENT`-gated; amount taken server-side; proof **required** for non-cash, validated + stored via the Feature 3 `StorageService`, `Payment.proofKey` persisted and the superseded object deleted on resubmit); all transitions go through `BookingsService.applyTransition` so the **single state machine stays authoritative** (added the `WAITING_PAYMENT → CONFIRMED` cash edge) and every step lands in `BookingStatusHistory`; audit logs on submit/verify/reject. Public `GET /payments/instructions` serves bank/mobile-money/WhatsApp details from validated env config. Frontend `features/payments`: guest **`PaymentSection`** (method picker + live instructions + screenshot upload + reference + **WhatsApp** link; under-review / verified / rejected / cash-pending states), admin **`/admin/payments`** queue (`DataTable`, defaults to SUBMITTED, **proof thumbnail/link**) **and** a payment card with the proof image + verify/reject on the admin booking page (shared `PaymentReviewActions`). `PaymentStatusBadge`, nav link added. Verified: migrate + typecheck + build both apps; ICU valid in all 3 locales; full lifecycle smoke — booking auto-`WAITING_PAYMENT`, bank-without-proof → 400, bank-with-proof → `PROOF_SUBMITTED` (proof file served, then **deleted on resubmit** → 404), cash → stays `WAITING_PAYMENT` → admin confirms → `CONFIRMED`, reject → resubmit, 403 non-owner / non-admin, server-side amount, full history trail.

- Backend `modules/payments`: offline payment records (bank transfer, mobile money, cash), admin verification flow
- Frontend `features/payments`: payment instructions page, payment method selection, admin validation UI
- WhatsApp support link

## Feature 7 — Uploads 📤 ✅ DONE

> Delivered **in place** rather than as a separate module (feature-based architecture — a standalone `modules/uploads` would just duplicate what the payment flow owns). The secure proof-image upload was built in **Feature 6** (multipart `POST /bookings/:id/payment` → `StorageService` → `Payment.proofKey`, with the frontend dropzone in `PaymentSection`), reusing the **Feature 3** `StorageModule` (R2 + local fallback). This step added **upload hardening** to satisfy "secure file upload": a shared `common/storage/image-upload.ts` (`imageUploadOptions`) applied to **both** multipart endpoints (payment proof + apartment images) — Multer now rejects non-images via `fileFilter` and caps body size (`limits.fileSize`, 15 MB memory backstop + `files: 1`) **at the stream level**, before anything is buffered, while the precise configurable `MAX_UPLOAD_SIZE_MB` check stays in the service. The MIME→extension map is now a single source of truth shared by the filter and `StorageService`. `AllExceptionsFilter` maps Multer errors to clean **413 / 400** (no 500, no stack leak). Verified: typecheck + build; wrong type → 400, 16 MB → 413 "File too large", valid PNG → SUBMITTED, zero server errors.

- ✅ **Storage layer already built in Feature 3** — global `StorageModule` (Cloudflare R2 + local fallback), reused here for payment-proof uploads.
- Backend secure file upload (payment proof images), validation, storage (via `StorageService`) — implemented in `modules/payments`
- Frontend proof image upload UI, wired into the booking/payment flow — implemented in `features/payments`

## Feature 8 — Notifications 🔔

- Backend `modules/notifications`: notification model events (booking status changes, payment validation)
- Frontend `features/notifications`: notification list/bell, mark-as-read

## Feature 9 — Dashboard 📊

- Backend: analytics aggregation endpoints
- Frontend `features/dashboard`: admin dashboard (Linear-style), `DashboardCard` metrics, bookings/payments overview, `DataTable` listings

## Feature 10 - Home page ✅ DONE

> Built: public landing page (`/[locale]`) inspired by darelkhair.xyz. New `features/home` with composable sections — **Hero** (full-bleed Unsplash backdrop + teal gradient overlay, eyebrow, headline, "Discover" CTA → `/apartments` + "How it works" anchor), **Featured apartments** (reuses the `useApartments` query + shared `ApartmentCard`, shows up to 6 real published listings with skeletons/empty state and a "View all" link), **Why choose us** (3 value blocks: easy bookings, secure payment, prime locations), **How it works** (Browse → Book → Stay, numbered steps), **Testimonials** (3 guest cards with 5-star ratings), and a closing **CTA banner**. Added an app-wide `SiteFooter` (brand blurb, quick links, year + copyright) into the locale layout, plus a Home nav link in `SiteHeader`. All copy localized FR/AR/EN under the expanded `home` namespace. Brand palette applied (teal primary, orange CTA, gold accents) and RTL-safe (logical props, `rtl:rotate-180` on arrows). Verified: JSON valid in all 3 locales, typecheck + production build green (home prerendered SSG per locale).

## Feature 11 - About us ✅ DONE

> Built: public About page (`/[locale]/about`) inspired by darelkhair.xyz/about. New `features/about` with composable sections — **heading band** (teal surface, title + tagline), **Our story** (two narrative paragraphs + Unsplash image), **Stats** band (20+ apartments · 4.9 rating · 500+ guests · 3+ years), **Mission & Vision** (two icon cards), **Core values** (Excellence / Hospitality / Innovation pillars), and a closing **CTA** → `/apartments`. New `about` i18n namespace in FR/AR/EN + an `about` nav key; About link added to both `SiteHeader` and `SiteFooter`. Per-locale `<title>` via `generateMetadata`. Brand palette + RTL-safe. Verified: JSON valid in all 3 locales, typecheck + production build green (about prerendered SSG per locale).

## Feature 12 - Contact us ✅ DONE

> Built full-stack, inspired by darelkhair.xyz/contact. **Backend** `modules/contact`: new `ContactMessage` model + `ContactStatus` enum (NEW/HANDLED) with migration `feature_12_contact_messages`; public `POST /contact` (validated DTO — name/email/subject/message, audited, captures ip/userAgent) and public `GET /contact/info` (address/phone/email/WhatsApp from validated `CONTACT_*` env config, WhatsApp falls back to `PAYMENT_WHATSAPP_NUMBER`); admin (`@Roles(ADMIN)`) `GET /contact` (paginated + status filter + search), `GET /contact/:id`, `PATCH /contact/:id` (triage NEW↔HANDLED, stamps `handledAt`, audited), `DELETE /contact/:id` (audited). **Frontend** `features/contact`: public `/contact` page (teal heading band + two-column "Send us a message" form with localized zod validation & success panel + contact-details column with tel:/mailto:/wa.me links), admin inbox `/admin/contact` (`DataTable` with search, status filter, paging; row actions = view-message dialog, mark handled/new, delete-with-confirm). Contact links added to `SiteHeader`, `SiteFooter`, and the admin dropdown; per-locale `<title>`. New `contact` + `admin.contact` i18n namespaces + nav keys in FR/AR/EN; `.env.example` updated. Verified: prisma migrate applied, typecheck + build green for both apps; live smoke — info from config, valid submit → NEW, validation → 400, admin guard → 401, admin login → list/filter → mark HANDLED (handledAt set) → delete 200, invalid enum → 400.

## Feature 13 - appartment review

## Feature 14 - Billing

## Unit tests

## Optional : admin can have slider on home page that he can change

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
