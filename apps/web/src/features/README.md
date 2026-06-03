# Features (frontend)

Feature-based architecture. Each feature is self-contained and owns everything it
needs. **Never** import across feature boundaries — share only via
`@/components` (design system), `@/lib`, and `@/i18n`.

Build order (one at a time): `auth → users → apartments → availability → bookings → payments → uploads → notifications → dashboard`.

Each feature follows this internal structure:

```
features/<feature>/
  components/   # feature-specific UI (composed from @/components/ui + @/components/shared)
  hooks/        # React Query hooks (queries/mutations)
  api/          # axios calls hitting the NestJS API (uses @/lib/api-client)
  store/        # Zustand store(s) for this feature's client state (if needed)
  types/        # TypeScript types/DTO mirrors for this feature
  utils/        # pure helpers for this feature
```

Routing lives in `app/[locale]/...` and imports from the relevant feature.
