---
description: Core coding standards for nestjs-example — MikroORM/PostgreSQL, class-validator DTOs, NestJS built-in error handling, and layer discipline
alwaysApply: true
---

# Coding Standards

## Layer Discipline

```
Controller → Service → Repository (MikroORM) → PostgreSQL
```

- **Controllers**: parse the request via a `class-validator` DTO (validated by the global
  `ValidationPipe`), call the Service, return its result. No business logic, no direct
  repository/`EntityManager` access.
- **Services**: hold business logic. The only layer that talks to MikroORM — inject
  `EntityRepository<Entity>` (and `EntityManager` when a persist/flush across entities is needed)
  via constructor. Throw NestJS built-in exceptions for error cases.
- **Entities**: `@Entity()` classes with `@PrimaryKey()`/`@Property()` fields. No business logic
  inside entities.
- **DTOs**: `class-validator`-decorated classes for request validation; response shape returned
  directly from the entity (or a lightweight object) — no separate Mapper layer unless a real need
  to hide entity internals shows up.

## Persistence (MikroORM)

- Register entities per feature module: `MikroOrmModule.forFeature([Entity])`.
- Inject with `@InjectRepository(Entity) private readonly xRepository: EntityRepository<Entity>`.
- MikroORM uses a unit-of-work, not TypeORM-style `.save()`: create with `repository.create({...})`
  or `new Entity(...)`, then persist with `em.persistAndFlush(entity)` (or `em.flush()` after
  `em.persist(entity)` for batched writes). Never assume a `.save()` method exists on the repository.
- `MikroOrmModule.forRoot()` config lives in `AppModule`; as of MikroORM v7 the config object must be
  passed explicitly (no empty-argument `forRoot()`).

## Validation

- DTOs live in `<domain>.dto.ts`, one class per request shape (e.g. `RegisterDto`, `LoginDto`),
  using `class-validator` decorators (`@IsEmail()`, `@IsString()`, `@MinLength()`, ...).
- Rely on a global `ValidationPipe({ whitelist: true, transform: true })` registered in `main.ts`
  (add it when the first DTO-consuming route lands) — do not hand-roll manual validation in
  controllers or services.

## Error Handling

- Throw NestJS built-in exceptions directly from Services: `NotFoundException`,
  `BadRequestException`, `UnauthorizedException`, `ConflictException`, etc. from `@nestjs/common`.
- No custom `AppError`/`ErrorCode` class — NestJS's built-in exception filter already maps these to
  the right HTTP status and a consistent JSON error shape. Only introduce a custom exception filter
  if a real, observed need for a different response shape shows up.

## Auth (first feature)

- `@nestjs/passport` + `passport-jwt`: a `Strategy` subclass validates the bearer token and returns
  the authenticated user payload.
- `@nestjs/jwt`'s `JwtService` signs/verifies tokens.
- `bcrypt` hashes passwords before persisting; never store or log a plaintext password.
- Protect routes with a guard: `@UseGuards(AuthGuard('jwt'))`, or a project `JwtAuthGuard` extending
  it once more than one route needs it.

## File Naming

Mirror the domain across layers:

| Type       | Convention              | Example                |
| ---------- | ------------------------ | ----------------------- |
| Entity     | `<domain>.entity.ts`     | `user.entity.ts`        |
| DTO        | `<domain>.dto.ts`        | `auth.dto.ts`           |
| Service    | `<domain>.service.ts`    | `auth.service.ts`       |
| Controller | `<domain>.controller.ts` | `auth.controller.ts`    |
| Module     | `<domain>.module.ts`     | `auth.module.ts`        |

Full working examples for every layer live in `.claude/templates/` (`entity.ts`, `dto.ts`,
`service.ts`, `controller.ts`, `module.ts`, `jwt.strategy.ts`) — that is the source of truth for
exact code shape; this file states the rules, not duplicate code samples.

## Code Quality Checklist

- [ ] Explicit TypeScript types on all function params and return values
- [ ] No business logic in controllers
- [ ] No direct repository/`EntityManager` access outside services
- [ ] Entity uses `@Entity()`/`@PrimaryKey()`/`@Property()`, no manual business logic
- [ ] DTOs validated via `class-validator` + global `ValidationPipe`
- [ ] Errors thrown via NestJS built-in exceptions, not ad-hoc objects
- [ ] Passwords hashed with `bcrypt`, never logged or returned in responses
- [ ] Tests cover happy path + error cases
