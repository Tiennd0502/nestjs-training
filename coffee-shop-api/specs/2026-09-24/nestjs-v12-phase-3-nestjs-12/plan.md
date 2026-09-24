# NestJS v12 Upgrade — Phase 3: NestJS 12 — Task Doc

Parent spec: `specs/2026-09-24/nestjs-v12-upgrade/plan.md` (sections 3–5, Phase 3).
References: [Release v12.0.0](https://github.com/nestjs/nest/releases/tag/v12.0.0),
[NestJS migration guide](https://docs.nestjs.com/migration-guide).

## 1. Task Understanding

- This phase moves every `@nestjs/*` package to its v12-compatible release.
- The upgrade is one atomic step, because the packages' peer ranges depend on each other:
  - `@nestjs/swagger` 12, `@nestjs/testing` 12 and `@nestjs/platform-express` 12 require
    `@nestjs/core` and `@nestjs/common` ^12.
  - `@nestjs/core` 12 requires `@nestjs/platform-express` ^12.
- Most v12 breaking changes don't affect this codebase. See parent spec section 3:
  - no lifecycle hooks;
  - no `@Optional()`;
  - logger calls pass only strings or a string plus a stack;
  - no NATS, GraphQL, Terminus or Webpack.
- These v12 changes do touch the codebase and must be confirmed unchanged in behavior:
  - `ValidationPipe`'s error format changed. The project overrides it with a custom
    `exceptionFactory` in `src/configs/validation-pipe.config.ts`, so the response shape should
    stay the same.
  - `@nestjs/config` moves to Standard Schema. The project passes a custom `validate` function
    from `src/configs/env.validation.ts`, not a Joi schema, so env validation should stay the
    same.
  - Core packages are ESM-only. The app stays CommonJS and loads them through Node's
    `require(esm)`, enabled by the Node ≥ 24.15 pin from Phase 0.
- Tooling runs through `nest upgrade`: first in dry-run mode, and then only its version bumps are
  accepted. Proposals to switch to ESM, Vitest or oxlint are rejected, per the parent spec's scope.
- Once the upgrade itself is verified (Tasks 1–4), the phase adopts five v12 features (Tasks
  5–9):
  - Express graceful shutdown, through `app.enableShutdownHooks()`.
  - `errorCode` support in `GlobalExceptionFilter`.
  - Route conflict diagnostics (`routeConflictPolicy`).
  - `StandardSchemaValidationPipe`, piloted on one route.
  - `@nestjs/observe`, enabled outside production only.
- Every feature task keeps current API responses unchanged. The pilot route's 400 body must stay
  identical to the baseline.

## 2. Desired Outcome (Checklist)

- [ ] All `@nestjs/*` packages are on v12-compatible versions.
- [ ] `pnpm install` reports no peer warnings for `@nestjs/*`, `@mikro-orm/nestjs` or `typescript`.
- [ ] The app still builds as CommonJS with `nest build`, including the Swagger CLI plugin.
- [ ] Validation, env validation, rate limiting and Swagger behave as in the baseline.
- [ ] The app drains in-flight requests and closes cleanly on SIGTERM.
- [ ] `GlobalExceptionFilter` honors an `errorCode` carried by an `HttpException`.
- [ ] Duplicate routes fail at boot, and shadowed routes log a warning.
- [ ] One route validates its body through `StandardSchemaValidationPipe`, with an unchanged
      contract.
- [ ] `@nestjs/observe` instruments the app outside production. Where its telemetry goes is
      documented.
- [ ] Lint, build and unit tests pass.

## 3. Input (current state)

- `coffee-shop-api/package.json` dependencies:
  - `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` at ^11.0.1 (11.2.1 installed);
  - `@nestjs/swagger` ^11.4.7;
  - `@nestjs/config` ^4.0.4;
  - `@nestjs/throttler` ^6.5.0.
- `coffee-shop-api/package.json` devDependencies:
  - `@nestjs/cli` ^11.0.0;
  - `@nestjs/schematics` ^11.0.0;
  - `@nestjs/testing` ^11.0.1.
- `coffee-shop-api/nest-cli.json` uses the `@nestjs/swagger` compiler plugin with `deleteOutDir`.
- `coffee-shop-api/src/app.module.ts` registers:
  - `ConfigModule.forRoot({ isGlobal: true, validate })`;
  - `ThrottlerModule.forRootAsync` with a global `ThrottlerGuard`;
  - `MikroOrmModule.forRoot`;
  - `GlobalExceptionFilter`;
  - the validation pipe from `createValidationPipe`.
- `coffee-shop-api/src/main.ts` sets up:
  - `rawBody: true`;
  - helmet and CORS;
  - global prefix `api` (excluding `POST webhooks/clerk`);
  - URI versioning;
  - Swagger.
- `coffee-shop-api/src/main.ts` does not call `enableShutdownHooks()`.
- `coffee-shop-api/src/common/filters/global-exception.filter.ts` maps a built-in
  `HttpException` to a status-based default `errCode`. It ignores any code the exception carries.
- `POST /api/v1/categories` validates `CreateCategoryDto`
  (`src/modules/category/dto/create-category.dto.ts`) through class-validator. No Standard
  Schema library is installed.
- No observability SDK is installed.
- Phase 2 is complete: MikroORM 7 with `@mikro-orm/nestjs` 7.1.x, which already accepts Nest 12.

## 4. Output (target state)

- `coffee-shop-api/package.json` and `pnpm-lock.yaml`:
  - `@nestjs/common`, `core`, `platform-express`, `testing` ^12.1.0;
  - `@nestjs/swagger` ^12.0.2;
  - `@nestjs/config` ^12.0.1;
  - `@nestjs/throttler` ^6.7.0;
  - `@nestjs/cli` ^12.0.6;
  - `@nestjs/schematics` ^12.0.5.
- `typescript` stays on `~6.0.x`, whatever `nest upgrade` proposes.
- `coffee-shop-api/nest-cli.json` is unchanged, unless the v12 CLI requires a schema update.
- Tasks 1–4: no source changes are expected. Any change that turns out to be required stays
  minimal and is listed in the phase commit message.
- Tasks 5–9:
  - `src/main.ts` enables shutdown hooks and route conflict diagnostics.
  - `GlobalExceptionFilter` honors `errorCode`.
  - `zod` is added, and `StandardSchemaValidationPipe` is registered globally next to the existing
    validation pipe.
  - `POST /api/v1/categories` validates its body with a Zod schema in
    `src/modules/category/dto/`.
  - `@nestjs/observe` is installed and wired in `src/app.module.ts` and `src/main.ts`, active
    outside production only.
  - A short note recording where observe telemetry is sent is kept in this plan's folder.

## Non-goals
- No move to ESM, Vitest, oxlint, Rspack or `package.json` `"type": "module"`.
- No `routeResolutionStrategy`. It changes how routes are matched, not just how conflicts are
  reported.
- No `StandardSchemaSerializerInterceptor`, and no Standard Schema on routes other than the
  pilot. Every other request DTO stays on class-validator.
- No `@nestjs/observe` in production until Task 9's findings are reviewed.
- No change to where services throw errors. `errorCode` is only honored when present.
- No changes to `ConsoleLogger` configuration. Structured params are on by default, and they don't
  affect current log calls.

## Ordering

- Task 1 must land before Task 2, because the CLI and schematics need the runtime packages at
  v12.
- Tasks 3 and 4 need Tasks 1–2.
- Tasks 5–9 start only after Tasks 1–4 pass. The upgrade is verified before any new feature
  lands. Each feature task is its own commit.
- Task 8 needs Task 3's confirmation that validation errors match the baseline, because the pilot
  must produce the same 400 body.
- Tasks 5, 6, 7 and 9 are independent of each other.

---

## Task Checklist

- [ ] Task 1: Upgrade the NestJS runtime packages
- [ ] Task 2: Upgrade the NestJS CLI, schematics and testing packages
- [ ] Task 3: Confirm request validation and error shape are unchanged
- [ ] Task 4: Confirm config validation, rate limiting and Swagger are unchanged
- [ ] Task 5: Enable graceful shutdown
- [ ] Task 6: Honor `errorCode` in `GlobalExceptionFilter`
- [ ] Task 7: Enable route conflict diagnostics
- [ ] Task 8: Pilot `StandardSchemaValidationPipe` on `POST /categories`
- [ ] Task 9: Add `@nestjs/observe` outside production

---

### Task 1: Upgrade the NestJS runtime packages

**Description:**
- These packages are the upgrade target itself.
- They must move together, because `@nestjs/core` 12 and its companion packages each require the
  others at ^12.

**Input:**
- `coffee-shop-api/package.json` dependencies:
  - `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` (^11.0.1);
  - `@nestjs/swagger` (^11.4.7);
  - `@nestjs/config` (^4.0.4);
  - `@nestjs/throttler` (^6.5.0).

**Output:**
- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` at ^12.1.0.
- `@nestjs/swagger` at ^12.0.2.
- `@nestjs/config` at ^12.0.1.
- `@nestjs/throttler` at ^6.7.0.
- `pnpm-lock.yaml` updated.
- `package.json` has no `"type": "module"`.

**Acceptance Criteria:**

- [ ] Every runtime `@nestjs/*` package resolves to a version that lists `@nestjs/core` ^12 as
      supported.
- [ ] `@mikro-orm/nestjs` reports no peer warning against `@nestjs/*` 12.
- [ ] Build passes. The compiled `dist/main.js` is CommonJS and boots the app.
- [ ] No `ERR_REQUIRE_ASYNC_MODULE` or other ESM loading error on startup, or when Jest loads the
      packages.

**Verification:**

- The full unit suite passes with the same counts as `baseline.md`, including:
  - `src/common/guards/auth.guard.spec.ts`;
  - `src/common/guards/roles.guard.spec.ts`;
  - `src/common/interceptors/transform-response.interceptor.spec.ts`;
  - `src/common/middlewares/clerk-auth.middleware.spec.ts`;
  - `src/common/middlewares/user-resolution.middleware.spec.ts`;
  - `src/modules/webhook/controllers/webhook.controller.spec.ts`.

---

### Task 2: Upgrade the NestJS CLI, schematics and testing packages

**Description:**
- `@nestjs/testing` 12 is needed to compile test modules against core 12.
- The CLI and schematics 12 ship the TS 6 toolchain.
- The CLI also provides `nest upgrade`, which reviews the project for mechanical v12 migrations.

**Input:**
- `coffee-shop-api/package.json` devDependencies:
  - `@nestjs/cli` ^11.0.0;
  - `@nestjs/schematics` ^11.0.0;
  - `@nestjs/testing` ^11.0.1.
- `coffee-shop-api/nest-cli.json`.

**Output:**
- `@nestjs/cli` ^12.0.6, `@nestjs/schematics` ^12.0.5, `@nestjs/testing` ^12.1.0.
- The dry-run output of `nest upgrade` has been reviewed. Only version bumps and mechanical
  migrations relevant to CommonJS + Jest are applied.
- Any rejected proposal (ESM, Vitest, oxlint, Rspack, a TypeScript bump beyond 6.0.x) is listed in
  the phase commit message.

**Acceptance Criteria:**

- [ ] `nest build` succeeds with the `@nestjs/swagger` compiler plugin still active. DTO
      properties without explicit `@ApiProperty()` still appear in the generated OpenAPI schema.
- [ ] `nest start --watch` boots the app and rebuilds on a source change.
- [ ] `typescript` is still on `~6.0.x`.
- [ ] The Jest configuration is unchanged. `package.json` `jest` and `test/jest-e2e.json` still
      use `ts-jest`.

**Verification:**

- The full unit suite passes. Every spec builds its `TestingModule` through `@nestjs/testing` 12.
- The full e2e suite passes. Every suite boots `AppModule` through
  `test/utils/init-test-app.util.ts`.

---

### Task 3: Confirm request validation and error shape are unchanged

**Description:**
- v12 changes `ValidationPipe`'s default error format.
- The project overrides it with a custom `exceptionFactory`, so client-visible 400 bodies should
  be identical. This task proves it.
- It also confirms that the other error paths through `GlobalExceptionFilter` are unaffected.

**Input:**
- `coffee-shop-api/src/configs/validation-pipe.config.ts`: `whitelist`, `transform`, and an
  `exceptionFactory` building `ValidationException`.
- `coffee-shop-api/src/common/utils/validation-error.util.ts`.
- `coffee-shop-api/src/common/filters/global-exception.filter.ts`.
- The error bodies recorded in `baseline.md` (Phase 0).

**Output:**
- No source change, if the bodies match.
- If they differ, the smallest change to the validation pipe config that restores the baseline
  shape, with the cause recorded in the phase commit message.

**Acceptance Criteria:**

- [ ] The 400, 401, 403, 404 and 409 bodies match `baseline.md` exactly (status code, `message`,
      every `errors[]` entry).
- [ ] Unknown request properties are still stripped (`whitelist`).
- [ ] Query and path params are still transformed to their DTO types (`transform`).

**Verification:**

- `CategoryController (e2e)` → `POST /categories responds 400 with field-level errors for an
  invalid name`.
- `UserController auth (e2e)` → `Clerk session with no matching local user` →
  `GET /users responds 401`.
- `CategoryController (e2e)` → `POST /categories responds 403`.
- `ProductController (e2e)` → `GET /products/:id responds 404 for a missing product`.
- `ProductController (e2e)` → `POST /products responds 409 for a duplicate name`.
- `GlobalExceptionFilter (e2e)` → `responds 500 with the consistent error envelope when a route
  throws a non-HttpException error`.
- Unit: `src/common/utils/validation-error.util.spec.ts`,
  `src/common/filters/global-exception.filter.spec.ts`,
  `src/common/dto/pagination-query.dto.spec.ts`.
- The response bodies from the tests above are compared by hand against `baseline.md`.

---

### Task 4: Confirm config validation, rate limiting and Swagger are unchanged

**Description:**
- `@nestjs/config` jumps from v4 to v12, `@nestjs/throttler` gets a minor bump, and
  `@nestjs/swagger` jumps a major version.
- None of their behavior has automated coverage in this repo, so it's checked by hand.

**Input:**
- `coffee-shop-api/src/configs/env.validation.ts` (custom `validate` passed to
  `ConfigModule.forRoot`).
- `coffee-shop-api/src/configs/rate-limit.config.ts` with the global `ThrottlerGuard` in
  `src/app.module.ts`.
- `coffee-shop-api/src/configs/swagger.config.ts`, mounted at `/docs` outside production.
- Coverage gap: no test exercises env validation, throttling or the OpenAPI document.

**Output:**
- No source change expected.
- The results of the three manual checks are recorded in the phase commit message.

**Acceptance Criteria:**

- [ ] Starting the app with a required env variable missing fails at boot with the validation
      error from `env.validation.ts`, as on v11.
- [ ] Exceeding the configured rate limit on any route returns 429 in the standard error envelope.
- [ ] `/docs` loads outside production and lists every controller's routes. It shows the bearer
      auth scheme and the response/error schemas from `src/common/decorators/api-response.decorator.ts`.
- [ ] `/docs` is not served when `NODE_ENV` is `production`.

**Verification:**

- Manual checks, as described in the Acceptance Criteria.
- No new automated test. Adding coverage for env validation, throttling or OpenAPI output is
  outside the upgrade's scope.

---

### Task 5: Enable graceful shutdown

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

### Task 6: Honor `errorCode` in `GlobalExceptionFilter`

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
- `GlobalExceptionFilter (e2e)` and the baseline error cases listed in Task 3 pass unchanged.

---

### Task 7: Enable route conflict diagnostics

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

### Task 8: Pilot `StandardSchemaValidationPipe` on `POST /categories`

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
- Manual: `/docs` request schema for `POST /categories` is compared with the Phase 3 Task 4 check.

---

### Task 9: Add `@nestjs/observe` outside production

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
