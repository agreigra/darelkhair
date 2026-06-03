# Modules (backend)

Feature-based NestJS modules. Each module is self-contained:

```
modules/<feature>/
  <feature>.module.ts
  <feature>.controller.ts
  <feature>.service.ts
  <feature>.repository.ts     # data access (wraps PrismaService)
  dto/                        # request/response DTOs + class-validator rules
  entities/                   # (if needed) domain types
  guards/                     # (if needed) feature guards
```

Build order (one at a time): `auth → users → apartments → availability → bookings → payments → uploads → notifications → dashboard`.

Modules are registered in `src/app.module.ts` as they are built. Cross-feature
needs go through shared infra (`PrismaModule`, `AppConfigModule`, common
filters/interceptors) — never by importing another feature's internals.

`health/` is the baseline module proving DI + Prisma wiring works.
