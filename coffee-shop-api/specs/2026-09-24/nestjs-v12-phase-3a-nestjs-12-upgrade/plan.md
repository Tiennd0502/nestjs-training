# NestJS v12 Upgrade — Phase 3a: NestJS 12 Upgrade — Task Doc

Parent spec: `specs/2026-09-24/nestjs-v12-upgrade/plan.md` (sections 3–5, Phase 3).
Phase overview: `specs/2026-09-24/nestjs-v12-phase-3-nestjs-12/plan.md`.
References: [Release v12.0.0](https://github.com/nestjs/nest/releases/tag/v12.0.0),
[NestJS migration guide](https://docs.nestjs.com/migration-guide).

## 1. Task Understanding

- First of the three Phase 3 plans:
  - **3a: upgrade** (this plan);
  - 3b: ESM;
  - 3c: v12 features.
- It moves every `@nestjs/*` package to its v12-compatible release. The project stays
  **CommonJS** here, and Phase 3b switches it to ESM.
- The upgrade is one atomic step, because the packages' peer ranges depend on each other:
  - `@nestjs/swagger` 12, `@nestjs/testing` 12 and `@nestjs/platform-express` 12 require
    `@nestjs/core` and `@nestjs/common` ^12.
  - `@nestjs/core` 12 requires `@nestjs/platform-express` ^12.
- Most v12 breaking changes don't affect this codebase. See parent spec section 3:
  - no lifecycle hooks;
  - no `@Optional()`;
  - no custom pipes;
  - logger calls pass only strings or a string plus a stack;
  - no NATS, GraphQL, Terminus or Webpack.
- These v12 changes do touch the codebase and must be confirmed unchanged in behavior:
  - `ValidationPipe`'s error format changed, and HTTP adapter error mapping was reworked. The
    project overrides validation errors with a custom `exceptionFactory` in
    `src/configs/validation-pipe.config.ts` and shapes every error in `GlobalExceptionFilter`,
    so response bodies should stay the same.
  - `@nestjs/config` moves to Standard Schema. The project passes a custom `validate` function
    from `src/configs/env.validation.ts`, not a Joi schema, so env validation should stay the
    same.
  - Core packages are ESM-only. The CommonJS app loads them through Node's `require(esm)`,
    enabled by the Node ≥ 24.15 pin from Phase 0.
- Tooling runs through `nest upgrade`: first in dry-run mode, and then only its version bumps are
  accepted. `nest upgrade` deliberately leaves the module format alone.

## 2. Desired Outcome (Checklist)

- [ ] All `@nestjs/*` packages are on v12-compatible versions.
- [ ] `pnpm install` reports no peer warnings for `@nestjs/*`, `@mikro-orm/nestjs` or `typescript`.
- [ ] The app still builds and boots as CommonJS with `nest build`, including the Swagger CLI
      plugin.
- [ ] Validation, error bodies, env validation, rate limiting and Swagger behave as in the
      baseline.
- [ ] Lint, build, unit and e2e tests pass.

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
- No source changes are expected. Any change that turns out to be required stays minimal and is
  listed in the phase commit message.

## Non-goals

- No module format change and no test runner change. Those are Phase 3b.
- No new v12 features. Those are Phase 3c.
- No oxlint and no Rspack.
- No changes to `ConsoleLogger` configuration. Structured params are on by default, and they don't
  affect current log calls.

## Ordering

- Task 1 must land before Task 2, because the CLI and schematics need the runtime packages at v12.
- Tasks 3 and 4 need Tasks 1–2.
- Phase 3b starts only after all four tasks pass.

---

## Task Checklist

- [ ] Task 1: Upgrade the NestJS runtime packages
- [ ] Task 2: Upgrade the NestJS CLI, schematics and testing packages
- [ ] Task 3: Confirm request validation and error shape are unchanged
- [ ] Task 4: Confirm config validation, rate limiting and Swagger are unchanged

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
- [ ] Build passes. The compiled `dist/main.js` is still CommonJS at this point (Phase 3b switches
      to ESM) and boots the app.
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
  migrations are applied. The module format and test runner are changed separately, in Phase 3b.
- Any rejected proposal (oxlint, Rspack, a TypeScript bump beyond 6.0.x) is listed in
  the phase commit message.

**Acceptance Criteria:**

- [ ] `nest build` succeeds with the `@nestjs/swagger` compiler plugin still active. DTO
      properties without explicit `@ApiProperty()` still appear in the generated OpenAPI schema.
- [ ] `nest start --watch` boots the app and rebuilds on a source change.
- [ ] `typescript` is still on `~6.0.x`.
- [ ] The Jest configuration is unchanged at this point. `package.json` `jest` and
      `test/jest-e2e.json` still use `ts-jest`. Phase 3b, Task 3 replaces them with Vitest.

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
