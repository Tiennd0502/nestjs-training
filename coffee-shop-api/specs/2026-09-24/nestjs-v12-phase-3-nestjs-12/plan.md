# NestJS v12 Upgrade — Phase 3: NestJS 12 — Overview

Parent spec: `specs/2026-09-24/nestjs-v12-upgrade/plan.md` (sections 3–5, Phase 3).
References: [Release v12.0.0](https://github.com/nestjs/nest/releases/tag/v12.0.0),
[NestJS migration guide](https://docs.nestjs.com/migration-guide).

Phase 3 is split into three plans, done in order. This page is the overview. Each linked plan
holds the full task docs.

| Plan | Scope | Tasks |
|---|---|---|
| [Phase 3a: NestJS 12 upgrade](../nestjs-v12-phase-3a-nestjs-12-upgrade/plan.md) | Move every `@nestjs/*` package to v12 and confirm behavior is unchanged, still on CommonJS | 4 |
| [Phase 3b: Move the project to ESM](../nestjs-v12-phase-3b-esm/plan.md) | `"type": "module"`, `.js` import extensions, CommonJS-only files, Jest → Vitest, end-to-end check | 4 |
| [Phase 3c: Adopt NestJS 12 features](../nestjs-v12-phase-3c-v12-features/plan.md) | Graceful shutdown, `errorCode`, route conflict diagnostics, Standard Schema pilot, `@nestjs/observe` | 5 |

## 1. Why three plans

- Each plan changes one kind of thing:
  - 3a: package versions;
  - 3b: module format and test runner;
  - 3c: new features.
- A failure in one plan can't be confused with a failure in another.
- The order is deliberate:
  - **3a before 3b:** the upgrade is verified on CommonJS first, which the migration guide
    supports (`nest upgrade` leaves the module format alone). The module format changes only
    once Nest 12 is known to work.
  - **3b before 3c:** new feature code is written as ESM from the start, not converted
    afterwards.
- The API contract stays the same through all three plans. Response bodies are compared with the
  Phase 0 baseline in 3a, again after the ESM switch in 3b, and on the pilot route in 3c.

## 2. Desired Outcome (Checklist)

- [ ] [3a] All `@nestjs/*` packages are on v12-compatible versions, with no peer warnings.
- [ ] [3a] Validation, error bodies, env validation, rate limiting and Swagger behave as in the
      baseline.
- [ ] [3b] The project is ESM (`"type": "module"`), and it builds and runs through every run path:
      `start:dev`, `start:prod`, MikroORM CLI, Docker, CI.
- [ ] [3b] Unit and e2e tests run on Vitest, with the same test counts and titles as on Jest.
- [ ] [3c] Graceful shutdown, `errorCode` support, route conflict diagnostics, the Standard
      Schema pilot and `@nestjs/observe` (outside production) are in place.
- [ ] Lint, build, unit and e2e pass at the end of each plan.

## 3. Ordering

- 3a → 3b → 3c. Each plan starts only after the previous one's last task passes.
- Within 3b, Tasks 1–3 are one logical change, verified together by Task 4.
- Within 3c, each feature is its own commit.

## 4. Non-goals (all of Phase 3)

- No oxlint and no Rspack. Linting stays on ESLint, and the build stays on `nest build` (tsc).
- No `routeResolutionStrategy`.
- No `StandardSchemaSerializerInterceptor`, and no Standard Schema beyond the one pilot route.
- No `@nestjs/observe` in production until Phase 3c, Task 5's findings are reviewed.

---

## Task Checklist

### [Phase 3a: NestJS 12 upgrade](../nestjs-v12-phase-3a-nestjs-12-upgrade/plan.md)

- [ ] Task 1: Upgrade the NestJS runtime packages
- [ ] Task 2: Upgrade the NestJS CLI, schematics and testing packages
- [ ] Task 3: Confirm request validation and error shape are unchanged
- [ ] Task 4: Confirm config validation, rate limiting and Swagger are unchanged

### [Phase 3b: Move the project to ESM](../nestjs-v12-phase-3b-esm/plan.md)

- [ ] Task 1: Switch the project to ESM and add import extensions
- [ ] Task 2: Replace CommonJS-only constructs
- [ ] Task 3: Move the test suites from Jest to Vitest
- [ ] Task 4: Verify the ESM build end to end

### [Phase 3c: Adopt NestJS 12 features](../nestjs-v12-phase-3c-v12-features/plan.md)

- [ ] Task 1: Enable graceful shutdown
- [ ] Task 2: Honor `errorCode` in `GlobalExceptionFilter`
- [ ] Task 3: Enable route conflict diagnostics
- [ ] Task 4: Pilot `StandardSchemaValidationPipe` on `POST /categories`
- [ ] Task 5: Add `@nestjs/observe` outside production
