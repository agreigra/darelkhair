# Unit Test Plan — DarElKhair

Plan for introducing **unit tests, module by module**, across the monorepo.
No test tooling exists yet (no runner, no scripts, zero test files), so this
covers standing up the harness first, then filling in tests per module.

These are **unit** tests: services / repositories / hooks / components tested in
isolation with mocked dependencies (Prisma, Mail, Audit, HTTP). No real DB and
no network. DB-backed integration / e2e is a separate, later effort.

## 0. Stack

| App                  | Runner                             | Libraries                                                        | Why                                                                                              |
| -------------------- | ---------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `apps/api` (NestJS)  | **Jest + ts-jest**                 | `@nestjs/testing`, `jest-mock-extended`                          | Nest's documented default; `Test.createTestingModule` + DI mocking is the idiomatic unit pattern |
| `apps/web` (Next.js) | **Vitest + React Testing Library** | `@testing-library/react`, `@testing-library/user-event`, `jsdom` | Fast, native ESM/TS, best fit for React component + hook units                                   |

## 1. Tooling setup

**API (`apps/api`)**

- Add devDeps: `jest`, `ts-jest`, `@types/jest`, `@nestjs/testing`, `jest-mock-extended`.
- `jest.config.ts`: `ts-jest` preset, `moduleNameMapper` for the `@/` path alias
  (mirror `tsconfig` paths), `testRegex: '.spec.ts$'`, `rootDir: src`.
- Scripts: `test`, `test:watch`, `test:cov`.
- Shared helpers:
  - typed Prisma mock factory using `mockDeep<PrismaService>()`,
  - builders for `AuditService` / `MailService` mocks.

**Web (`apps/web`)**

- Add devDeps: `vitest`, `@vitejs/plugin-react`, `jsdom`,
  `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`.
- `vitest.config.ts`: `jsdom` env, `@/` alias, setup file registering
  `jest-dom` matchers.
- Test helpers:
  - `renderWithProviders` wrapper (`QueryClientProvider` + `NextIntlClientProvider`
    with the `en` messages),
  - a mocked `apiClient`.

**Root**

- `pnpm test` → `pnpm -r test`; mirror the existing `typecheck` / `lint` script pattern.
- Add a CI step that runs `pnpm test`.

## 2. The unit boundary (what gets tested per module)

For each **API module**: focus on the **service** (business rules) with
repository / mail / audit mocked; the **repository** only where it builds
non-trivial Prisma queries (dynamic `where`, pagination); and **pure helpers**
(e.g. `booking-status.ts`, `common/utils/duration.ts`). Controllers get thin
tests only where they hold logic (cookie setting, status codes).

For each **web feature**: test **schemas** (zod validation), **hooks**
(mutation success / error → store / cache effects), and **forms** (validation
messages, submit payload shaping, success / error rendering).

Conventions:

- Co-locate: `foo.service.spec.ts` next to `foo.service.ts`; web `*.test.ts(x)`
  next to source.
- Naming: `describe('AuthService.resetPassword')` → `it('throws on an expired token')`.

## 3. API modules

### Priority 1 — logic-heavy / security-sensitive

- **auth**
  - register: duplicate email → `Conflict`.
  - login: bad creds, disabled account, timing-safe comparison path.
  - refresh: rotation, reuse-detection revokes the whole family, expiry.
  - logout: revokes the presented token.
  - **password reset** (forgot/reset): forgot → no account enumeration (uniform
    result), token issued + mail sent for active users, inactive/unknown user is
    a silent no-op; reset → invalid / expired / used token → `BadRequest`,
    success updates hash + marks token used + revokes all refresh tokens.
  - `MailService`: log-mode vs configured-transport branch.
  - `auth.repository`: password-reset token methods.
- **bookings** — date validation, overlap / availability conflict, total-price
  calc, status-transition guards (`booking-status.ts`), ownership checks; admin
  status changes + history append.
- **payments** — method / amount validation, proof submit, verify / reject
  transitions, status side-effects on the booking.
- **availability** — slot conflict detection, date-range overlap math.

### Priority 2 — CRUD + access rules

- **users** — `changePassword` (wrong current pw), admin self-lockout guards
  (can't deactivate / demote self, can't self-delete), list `where` / search
  builder, pagination.
- **reviews** — one-per-guest-per-apartment uniqueness, rating bounds, edit ownership.
- **notifications** — emit swallows errors, list / unread counts, mark-read ownership.

### Priority 3 — lighter

- **contact** — create + admin triage status.
- **dashboard** — aggregation mapping (mock repo counts).
- **apartments** — localized JSON handling, publish flag, image cover / sort;
  storage-key cleanup on delete.
- **common/utils** — `duration.ts` (`parseDurationToMs`) edge cases.
- **common/audit** — swallow-on-failure behavior.
- **common/storage** — driver selection (local vs r2).

## 4. Web features

- **auth** (priority 1)
  - schemas: login / register / forgot / reset.
  - hooks: `useLogin` sets session, `useLogout` clears store + cache,
    `useForgotPassword` / `useResetPassword` success + error.
  - forms: login error mapping (401 → `invalidCredentials`), register
    (409 → `emailTaken`), forgot success screen, reset no-token invalid screen +
    submit payload.
- **bookings / payments / availability** (priority 2) — date pickers, price
  display, status badges, query / mutation hooks.
- **apartments / reviews / notifications / contact / users / dashboard**
  (priority 3) — schema validation + presentational logic.
- **shared** — `api-client` unwrap + 401 silent-refresh interceptor
  (single-flight); `api-error` helpers.

## 5. Coverage targets

- Start with **no required threshold**.
- Ratchet to **70% lines on `src/modules` (api) and `src/features` (web)** once
  priority 1 + 2 land. No gate on controllers / DTOs initially.
- Each module's tests are independent → can be PR'd one module at a time.

## 6. Rollout order

- [x] **1. Setup PR** — both runners, configs, shared helpers, one smoke test per
      app, CI wiring. _(Done: Jest for api, Vitest for web, root `pnpm test`,
      shared mocks/`renderWithProviders`, smoke tests green, GitHub Actions CI +
      ESLint 9 flat-config migration for the api.)_
- [x] **2. auth (api + web)** — proves the patterns end-to-end; covers the
      just-shipped password reset. _(Done: AuthService spec — register/login/
      refresh/logout/forgot/reset, 21 cases; MailService spec — transport +
      swallow; web — auth schemas, hooks (login/forgot/reset), LoginForm 401
      mapping + forgot link.)_
- [ ] **3. Priority-1 API** — bookings, payments, availability.
- [ ] **4. Priority-2** — users, reviews, notifications + web hooks.
- [ ] **5. Priority-3 sweep** — remaining modules + common utils.
