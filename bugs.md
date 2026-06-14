# Bugs & polish backlog

Tracked individually — each item is self-contained. Solve one at a time; check it off when done.

---

### 1. Admin apartment edit page has no "back" navigation ✅ DONE

- [x] **Area:** [admin-apartment-edit.tsx](apps/web/src/features/apartments/components/admin-apartment-edit.tsx) · [edit route](<apps/web/src/app/[locale]/(app)/admin/apartments/[id]/edit/page.tsx>)
- **Problem:** Once on the admin apartment edit page there's no way to return to the apartments list (no back button/breadcrumb).
- **Expected:** A back link/button (e.g. in `PageHeader`) returning to `/admin/apartments`.

### 2. Add a "back" affordance / breadcrumbs across admin detail pages ✅ DONE

- [x] **Area:** `PageHeader` + admin detail pages (apartments, bookings, payments).
- **Problem:** Same root issue as #1 but broader — admin detail/edit pages lack consistent back navigation.
- **Expected:** A reusable optional back action on `PageHeader`, applied to all admin detail/edit pages.

### 3. Link to the apartment from the admin booking view

- [ ] **Area:** admin booking detail / booking card ([admin-booking-manage.tsx](apps/web/src/features/bookings/components/admin-booking-manage.tsx)).
- **Problem (FR):** "lien vers l'appartement dans la carte de réservation admin" — the apartment shown on an admin booking isn't clickable.
- **Expected:** The apartment title/thumbnail in the admin booking view links to that apartment's page.

### 4. Add a "HONORED" booking status (stay completed)

- [ ] **Area:** booking status machine — [booking-status.ts](apps/api/src/modules/bookings/booking-status.ts), `BookingStatus` enum (Prisma), `status` i18n (FR/AR/EN), `StatusBadge`.
- **Problem:** There's no terminal "stay completed" state. After `CONFIRMED`, a finished stay can't be marked as fulfilled.
- **Expected:** New `HONORED` status reachable from `CONFIRMED` (admin action), rendered everywhere `StatusBadge` is used; needs a migration + transition rule + translations.

### 5. Switching language on iPhone logs the user out ✅ DONE

- [x] **Area:** [language-switcher.tsx](apps/web/src/components/layout/language-switcher.tsx), auth/session ([api-client.ts](apps/web/src/lib/api-client.ts) silent refresh, refresh-cookie `SameSite`).
- **Problem:** On iPhone (Safari), changing the locale ends the session — the user is signed out.
- **Expected:** Locale switch preserves the session.
- **Likely cause:** access token is in-memory and the locale switch triggers a navigation; on Safari the httpOnly refresh cookie may be blocked by `SameSite`/`Secure`, so silent refresh fails. Verify cookie attributes + that the switch is a client-side nav, not a hard reload.

### 6. No mobile navigation (nav hidden, no menu) — _was: "menu not responsive" + "nav bar not shown on phone"_ ✅ DONE

- [x] **Area:** [site-header.tsx](apps/web/src/components/layout/site-header.tsx).
- **Problem:** The primary nav is `hidden md:flex`, so on phones there are no nav links at all and no hamburger menu to reach them.
- **Expected:** A responsive mobile menu (hamburger → drawer/sheet) exposing the same links (Home, Apartments, About, Contact + auth/admin items).

### 7. "En attente" (WAITING_PAYMENT) status wording/visibility for guests

- [ ] **Area:** booking `status` i18n + guest booking views.
- **Problem (needs confirmation):** The "en attente" status may be unclear or not surfaced well to the guest. _Original note was terse ("en attente status is not user?") — confirm intended behavior._
- **Expected (assumed):** Guests see a clear, action-oriented label for `WAITING_PAYMENT` (e.g. "Awaiting your payment") distinct from internal/admin wording.

### 8. Language switcher should be a dropdown ✅ DONE

- [x] **Area:** [language-switcher.tsx](apps/web/src/components/layout/language-switcher.tsx).
- **Problem:** All locales render as inline buttons; cramped, and worse on mobile.
- **Expected:** A single dropdown (shadcn `DropdownMenu`) showing the current language, expanding to the others.

### 9. Page-transition loader/spinner ✅ DONE

- [x] **Area:** app shell / root layout.
- **Problem:** No visual feedback when navigating between pages.
- **Expected:** A top progress bar or spinner shown during route transitions.

### 10. Wire real reviews into the home page ✅ DONE

- [x] **Area:** home testimonials ([testimonials.tsx](apps/web/src/features/home/components/testimonials.tsx)) + reviews feature (Feature 13).
- **Problem:** The home page "What our guests say" section uses hard-coded testimonials; real apartment reviews now exist.
- **Expected:** Surface real recent reviews (highest-rated / latest) on the home page, with a graceful fallback when there are none.
