# NestJS v12 Upgrade — Phase 3c: Adopt NestJS 12 Features — Task Doc

Parent spec: `specs/2026-09-24/nestjs-v12-upgrade/plan.md` (sections 5 and 8, Phase 3).
Phase overview: `specs/2026-09-24/nestjs-v12-phase-3-nestjs-12/plan.md`.
References: [Release v12.0.0](https://github.com/nestjs/nest/releases/tag/v12.0.0),
[NestJS migration guide](https://docs.nestjs.com/migration-guide),
[`@nestjs/observe` README](https://www.npmjs.com/package/@nestjs/observe).

## 1. Task Understanding

- Last of the three Phase 3 plans, after 3a (upgrade) and 3b (ESM). The code added here is
  written as ESM from the start.
- It adopts five v12 features, each as its own commit:
  - Express graceful shutdown, through `app.enableShutdownHooks()`.
  - `errorCode` support in `GlobalExceptionFilter`.
  - Route conflict diagnostics (`routeConflictPolicy`).
  - `StandardSchemaValidationPipe`, piloted on one route with Zod.
  - `@nestjs/observe`, enabled outside production only.
- Every feature keeps current API responses unchanged. The pilot route's 400 body must stay
  identical to the baseline.

## 2. Desired Outcome (Checklist)

- [ ] The app drains in-flight requests and closes cleanly on SIGTERM.
- [ ] `GlobalExceptionFilter` honors an `errorCode` carried by an `HttpException`.
- [ ] Duplicate routes fail at boot, and shadowed routes log a warning.
- [ ] One route validates its body through `StandardSchemaValidationPipe`, with an unchanged
      contract.
- [ ] `@nestjs/observe` instruments the app outside production. Where its telemetry goes is
      documented.
- [ ] Lint, build, unit and e2e tests pass. Baseline response bodies are unchanged.

## 3. Input (current state)

- Phase 3b is complete: NestJS 12, ESM build, tests on Vitest.
- `coffee-shop-api/src/main.ts` does not call `enableShutdownHooks()` and sets no route conflict
  policy.
- `coffee-shop-api/src/common/filters/global-exception.filter.ts` maps a built-in
  `HttpException` to a status-based default `errCode`. It ignores any code the exception carries.
- `POST /api/v1/categories` validates `CreateCategoryDto`
  (`src/modules/category/dto/create-category.dto.ts`) through class-validator. No Standard
  Schema library is installed.
- No observability SDK is installed.

## 4. Output (target state)

- `src/main.ts` enables shutdown hooks and route conflict diagnostics.
- `GlobalExceptionFilter` honors `errorCode`.
- `zod` is added, and `StandardSchemaValidationPipe` is registered globally next to the existing
  validation pipe.
- `POST /api/v1/categories` validates its body with a Zod schema in `src/modules/category/dto/`.
- `@nestjs/observe` is installed and wired in `src/app.module.ts` and `src/main.ts`, active
  outside production only.
- A short note recording where observe telemetry is sent is kept in this plan's folder.

## Non-goals

- No `routeResolutionStrategy`. It changes how routes are matched, not just how conflicts are
  reported.
- No `StandardSchemaSerializerInterceptor`, and no Standard Schema on routes other than the
  pilot. Every other request DTO stays on class-validator.
- No `@nestjs/observe` in production until Task 5's findings are reviewed.
- No change to where services throw errors. `errorCode` is only honored when present.

## Ordering

- Each task is its own commit. Tasks 1, 2, 3 and 5 are independent of each other.
- Task 4 relies on Phase 3a, Task 3's confirmation that validation errors match the baseline,
  because the pilot must produce the same 400 body.

---

## Task Checklist

- [ ] Task 1: Enable graceful shutdown
- [ ] Task 2: Honor `errorCode` in `GlobalExceptionFilter`
- [ ] Task 3: Enable route conflict diagnostics
- [ ] Task 4: Pilot `StandardSchemaValidationPipe` on `POST /categories`
- [ ] Task 5: Add `@nestjs/observe` outside production

---

### Task 1: Enable graceful shutdown

**Description:**
- Nest doesn't listen for SIGTERM/SIGINT today.
- When Docker, Render or a redeploy stops the process, Node exits immediately:
  - in-flight requests are cut off;
  - the MikroORM connection pool is not closed.
- In v12 the Express adapter drains in-flight requests on shutdown, but only when shutdown hooks
  are enabled.

**Input:**
- `coffee-shop-api/src/main.ts`, which bootstraps the app without `enableShutdownHooks()`.
- `coffee-shop-api/Dockerfile`, which runs `node dist/main` in exec form, so Node receives
  signals directly.
- `docker-compose.yml`, which uses the default stop grace period.

**Output:**
- `src/main.ts` enables shutdown hooks before listening.
- `docker-compose.yml` sets an explicit stop grace period if the default (10s) is shorter than the
  slowest expected request. Otherwise it stays unchanged, and the reason is noted in the commit.

**Acceptance Criteria:**

- [ ] On SIGTERM, a request that is already in flight completes with its normal response before
      the process exits.
- [ ] No new request is accepted after SIGTERM.
- [ ] The process exits with code 0, and the MikroORM connection is closed. No "connection
      terminated" error is logged by Postgres.
- [ ] Startup and normal request handling are unchanged.

**Verification:**

- Manual: start the app, send a slow request (e.g. a large product list), send SIGTERM mid-request.
  The response arrives, and then the process exits cleanly.
- Manual: `docker stop` on the dev container exits within the grace period, without a forced kill.
- The full e2e suite passes. `test/utils/init-test-app.util.ts` boots without shutdown hooks and
  closes the app explicitly.

---

### Task 2: Honor `errorCode` in `GlobalExceptionFilter`

**Description:**
- v12 lets an `HttpException` carry a machine-readable `errorCode`.
- `GlobalExceptionFilter` builds its own `errors[].errCode` from the status code, so any
  `errorCode` passed to a built-in exception would be dropped.
- Honoring it lets future code, and third-party code throwing built-ins, give clients a stable
  code without a new `DomainException` subclass.

**Input:**
- `coffee-shop-api/src/common/filters/global-exception.filter.ts`. Its `HttpException` branch
  uses `DEFAULT_ERR_CODE_BY_STATUS`.
- `coffee-shop-api/src/common/filters/global-exception.filter.spec.ts`.

**Output:**
- For a built-in `HttpException` that carries an `errorCode`, the filter uses that code as the
  `errCode` of its single error entry.
- The exact accessor for `errorCode` is taken from the installed v12 `HttpException` type
  definitions.
- Without an `errorCode`, the current status-based default is kept.
- The `DomainException` branch is unchanged.

**Acceptance Criteria:**

- [ ] A built-in exception thrown with an `errorCode` yields a body whose `errors[0].errCode` is
      that code. Status and `message` follow the current rules.
- [ ] Every existing error body (baseline 400/401/403/404/409 and the 500 path) is unchanged.
- [ ] No throw site in `src/` is changed by this task.

**Verification:**

- `GlobalExceptionFilter` → `maps a built-in HttpException to a default status-based message and a
  single generic error entry` still passes.
- New case in `src/common/filters/global-exception.filter.spec.ts`: a built-in exception with an
  `errorCode` produces that code in `errors[0].errCode`.
- `GlobalExceptionFilter (e2e)` and the baseline error cases listed in Phase 3a, Task 3 pass unchanged.

---

### Task 3: Enable route conflict diagnostics

**Description:**
- Nest resolves routes in registration order. A route can silently shadow another. For example,
  `GET /users/:id` registered before `GET /users/me` would swallow `/me`.
- The v12 `routeConflictPolicy` option turns duplicates into boot errors and shadowing into
  warnings, so mistakes show up at startup instead of in production.

**Input:**
- `coffee-shop-api/src/main.ts` (`NestFactory.create` options).
- `coffee-shop-api/test/utils/init-test-app.util.ts` (e2e app bootstrap).
- Routes where order matters today: `GET /users/me` next to `GET /users/:id` in
  `src/modules/user/controllers/user.controller.ts`.

**Output:**
- The app is created with `routeConflictPolicy` set to fail on duplicate routes and warn on
  shadowed routes. These are the values documented in the v12 migration guide.
- The e2e bootstrap uses the same policy, if the testing app accepts it. Otherwise the gap is
  noted in the commit.
- `routeResolutionStrategy` is left at its default.

**Acceptance Criteria:**

- [ ] The app boots with no duplicate-route error and no shadow warning. Any warning found is
      fixed by reordering handlers, not by relaxing the policy.
- [ ] A deliberately added duplicate route, used as a temporary local check and then removed,
      makes boot fail.
- [ ] Routing is otherwise unchanged. `GET /users/me` still resolves to the current-user handler.

**Verification:**

- Manual: boot logs are checked for route conflict warnings, and the temporary duplicate check
  above is run.
- `UserController auth (e2e)` → `GET /me responds 200 with the caller own profile` and
  `GET /users responds 200 with the paginated envelope`.
- The full e2e suite passes.

---

### Task 4: Pilot `StandardSchemaValidationPipe` on `POST /categories`

**Description:**
- v12 adds schema-first validation through Standard Schema libraries. `@Body({ schema })` plus
  `StandardSchemaValidationPipe`, with the same schema feeding OpenAPI.
- Piloting it on one simple route proves the integration in this codebase without changing the
  validation standard of the whole project:
  - error envelope;
  - Swagger;
  - coexistence with class-validator.
- It uses Zod, the most widely used Standard Schema library. This is a new dependency next to
  class-validator.

**Input:**
- `POST /api/v1/categories` in `src/modules/category/controllers/category.controller.ts`, which
  takes `CreateCategoryDto`: `name`, a string, required, 2–100 characters.
- The global validation pipe from `src/configs/validation-pipe.config.ts`, registered as an app
  pipe in `src/app.module.ts`. Its `exceptionFactory` produces `ValidationException` with
  field-level entries.
- The baseline 400 body for an invalid category name (Phase 0).

**Output:**
- `zod` added to dependencies.
- `StandardSchemaValidationPipe` registered globally in `src/app.module.ts`, next to the existing
  validation pipe. The existing pipe keeps handling every class-validator DTO.
- A Zod schema for the create-category body in `src/modules/category/dto/`, with the same rules
  as `CreateCategoryDto`.
- `POST /categories` validates its body through that schema, via the `schema` option.
- Validation failures from the new pipe are mapped to the same `ValidationException` field-level
  envelope. They use the pipe's error hook if v12 provides one; otherwise they're mapped in the
  shared validation error utility. They are never returned as a generic 400.
- `CreateCategoryDto` stays, if Swagger or the service still needs the type. Otherwise it's
  replaced by the schema's inferred type.

**Acceptance Criteria:**

- [ ] An invalid name (missing, too short, too long, not a string) returns 400 with a body
      identical to the baseline: same `message`, and `errors[]` with `field: 'name'`.
- [ ] A valid request returns 201 with an unchanged body.
- [ ] Unknown body properties are still stripped or rejected exactly as today.
- [ ] `/docs` still documents the `POST /categories` request body with the same fields and
      constraints.
- [ ] Every other route still validates through class-validator, with unchanged behavior.

**Verification:**

- `CategoryController (e2e)` → `POST /categories responds 201 and creates a category with a
  derived slug` and `POST /categories responds 400 with field-level errors for an invalid name`.
  The 400 body is compared against `baseline.md`.
- New unit spec for the schema: valid name, too short, too long, missing, non-string.
- `src/common/utils/validation-error.util.spec.ts`, extended if the mapping lives there.
- Manual: `/docs` request schema for `POST /categories` is compared with the Phase 3a, Task 4 check.

---

### Task 5: Add `@nestjs/observe` outside production

**Description:**
- v12 ships an official observability SDK. It auto-instruments HTTP requests, among other
  things, through the `instrument` application option.
- The docs say "no collector to run", but they don't say where telemetry is sent or what it
  contains. That must be known before it runs anywhere with real user data.
- So the SDK is enabled outside production only, and its data destination is documented first.

**Input:**
- `coffee-shop-api/src/app.module.ts` and `coffee-shop-api/src/main.ts`, with no observability
  setup.
- The NestJS Observability documentation chapter.
- Swagger's existing production gating in `src/configs/swagger.config.ts`, the pattern to mirror.

**Output:**
- `observe-notes.md` in this plan's folder records:
  - where telemetry is sent;
  - what is captured (request paths, headers, bodies, user identifiers);
  - whether an account or API key is required;
  - what production enablement would need.
- `@nestjs/observe` added to dependencies.
- The observe module is created and registered in `src/app.module.ts` with a service id for this
  app. The instrument is passed to `NestFactory.create` in `src/main.ts`.
- Both are active only when `NODE_ENV` is not `production`, the same gating as Swagger.
- The service id comes from a non-secret constant in `src/common/constants/`. Any secret comes
  from `ConfigService`.

**Acceptance Criteria:**

- [ ] `observe-notes.md` answers all four questions in the Output, with links to the docs.
- [ ] In dev, an HTTP request produces telemetry visible where the notes say it goes.
- [ ] With `NODE_ENV=production`, the app boots without the observe module or instrument, and
      behaves exactly as before.
- [ ] Request latency and responses are unchanged in dev (no errors, no altered bodies).
- [ ] The e2e suite runs without observe, or with it disabled, and passes.

**Verification:**

- Manual: a dev request shows up in the telemetry destination. A production-mode boot shows no
  observe initialization.
- The full e2e suite passes.
