# NestJS v12 Upgrade — Phase 1: TypeScript 6 & Tooling — Task Doc

Parent spec: `specs/2026-09-24/nestjs-v12-upgrade/plan.md` (section 5, Phase 1).

## 1. Task Understanding

- NestJS 12 builds on TypeScript 6. This phase moves the compiler and the tools that depend on it
  to TS 6 while the app still runs **NestJS 11 + MikroORM 6**. Any breakage here is caused by the
  compiler or tooling alone.
- The target is TypeScript `~6.0.x`, not the npm `latest` tag (7.0.2). TS 7 is outside the
  supported range of:
  - `@nestjs/swagger` 12 (`^5.5 || ^6`),
  - `ts-jest` (`<7`),
  - `typescript-eslint` (`<6.1.0`).
- It replaces `ts-node` with `tsx` (a CLI that runs `.ts` files; unrelated to React/JSX) in the
  project scripts:
  - The reason is MikroORM 7: its CLI no longer supports `ts-node`.
  - It's done here so Phase 2 starts with a working runner.
- Correction to the parent spec: the parent says `ts-node` is removed in this phase. Here it is
  removed only once nothing references it. The MikroORM 6 CLI may still need it until Phase 2
  switches the CLI to `tsx`. If so, the removal moves to Phase 2.
- `tsconfig.json` sets `baseUrl: "./"` but defines no `paths`, and `src/` uses no `@/` alias
  imports. `baseUrl` is deprecated in TS 6, so it can be dropped without changing module
  resolution.

## 2. Desired Outcome (Checklist)

- [x] The project compiles, lints and tests on TypeScript 6.0.x.
- [x] `tsconfig.json` produces no TS 6 deprecation diagnostics.
- [x] The `pretest:e2e` and `test:debug` scripts run TypeScript through `tsx`.
- [x] No unused TS runner packages remain in `devDependencies`.
- [x] Lint, build, unit, e2e and the migration scripts pass with the same results as the Phase 0
      baseline.

## 3. Input (current state)

- `coffee-shop-api/package.json` `devDependencies`:
  - `typescript` ^5.7.3 (5.9.3 installed),
  - `ts-jest` ^29.2.5,
  - `jest` ^30.0.0,
  - `typescript-eslint` ^8.20.0,
  - `ts-node` ^10.9.2,
  - `tsconfig-paths` ^4.2.0.
- Scripts in `coffee-shop-api/package.json`:
  - `pretest:e2e` runs `test/reset-test-db.ts` through `ts-node --transpile-only` with
    `tsconfig-paths/register`.
  - `test:debug` preloads `tsconfig-paths/register` and `ts-node/register` before Jest.
- `coffee-shop-api/tsconfig.json`:
  - `module`/`moduleResolution` `nodenext`, `target` `ES2023`, `experimentalDecorators` and
    `emitDecoratorMetadata` on;
  - `baseUrl: "./"`, and no `paths`.
- `coffee-shop-api/eslint.config.mjs` uses `typescript-eslint` `recommendedTypeChecked`.
- Phase 0 is complete, and `baseline.md` exists.

## 4. Output (target state)

- `coffee-shop-api/package.json` and `pnpm-lock.yaml` with:
  - `typescript` pinned to `~6.0.3`,
  - `ts-jest` ^29.4.13,
  - `jest` ^30.5.2,
  - `typescript-eslint` ^8.70.1,
  - `tsx` added.
- `pretest:e2e` and `test:debug` run through `tsx`, with no `ts-node` or `tsconfig-paths`
  preloads.
- `coffee-shop-api/tsconfig.json` without `baseUrl`. Everything else is unchanged.
- `ts-node` and `tsconfig-paths` removed from `devDependencies`, if nothing else references them.

## Non-goals

- No NestJS or MikroORM version changes.
- No move to ESM or Vitest in this phase. That happens in Phase 3b. oxlint is not adopted.
- No new lint rules and no lint rule changes. Only fix violations the new versions report.

## Ordering

- Task 1 must land first. Tasks 2 and 3 depend on the TS 6 compiler being installed.
- Task 4 is last, because it removes packages only after the scripts stop using them.

---

## Task Checklist

- [x] Task 1: Upgrade TypeScript and the Jest toolchain
- [x] Task 2: Make `tsconfig.json` TS 6-clean
- [x] Task 3: Upgrade `typescript-eslint` and keep lint green
- [x] Task 4: Replace `ts-node` with `tsx` in project scripts

---

### Task 1: Upgrade TypeScript and the Jest toolchain

**Description:**
- NestJS 12 and its CLI ship with TypeScript 6.
- `ts-jest` compiles every spec, so it must support the same compiler.

**Input:**
- `coffee-shop-api/package.json` `devDependencies`: `typescript` ^5.7.3, `ts-jest` ^29.2.5,
  `jest` ^30.0.0.

**Output:**
- `typescript` pinned to `~6.0.3` (patch updates only; never 7.x).
- `ts-jest` at ^29.4.13 and `jest` at ^30.5.2.
- `pnpm-lock.yaml` updated.

**Acceptance Criteria:**

- [x] The installed TypeScript version is 6.0.x.
- [x] The version range in `package.json` cannot resolve to TypeScript 7.
- [x] `pnpm install` reports no TypeScript peer-range warnings from `ts-jest`.
- [x] Build passes. Any new type errors TS 6 reports are fixed in source, not suppressed.
- [x] The unit suite passes with the same counts as `baseline.md`.

**Verification:**

- The full unit suite (`src/**/*.spec.ts`) passes unchanged, including:
  - `GlobalExceptionFilter` in `src/common/filters/global-exception.filter.spec.ts`,
  - `DomainException` / `ValidationException` in `src/common/exceptions/base.exception.spec.ts`.

---

### Task 2: Make `tsconfig.json` TS 6-clean

**Description:**
- TS 6 deprecates `baseUrl`.
- The project sets it without using `paths` or `@/` imports, so it only adds a deprecation
  diagnostic.

**Input:**
- `coffee-shop-api/tsconfig.json`, with `baseUrl: "./"` and no `paths`.
- `coffee-shop-api/tsconfig.build.json`, which extends it.

**Output:**
- `coffee-shop-api/tsconfig.json` without `baseUrl`.
- All other compiler options stay unchanged.

**Acceptance Criteria:**

- [x] Build produces no TS 6 deprecation diagnostics.
- [x] No `ignoreDeprecations` setting is added.
- [x] Module resolution of every existing import is unchanged, and build output in `dist/` has the
      same file layout as before.
- [x] The options the NestJS 12 migration guide recommends stay as they are:
      `module`/`moduleResolution` `nodenext`, `resolvePackageJsonExports`, `target` `ES2023`,
      `experimentalDecorators`, `emitDecoratorMetadata`.

**Verification:**

- Build succeeds, and `dist/main.js` still boots the app.
- The full unit suite passes unchanged.

---

### Task 3: Upgrade `typescript-eslint` and keep lint green

**Description:**
- The installed `typescript-eslint` must support the TS 6 compiler.
- Otherwise lint either warns about an unsupported TypeScript version or misreports types.

**Input:**
- `coffee-shop-api/package.json`: `typescript-eslint` ^8.20.0 (8.67.0 installed).
- `coffee-shop-api/eslint.config.mjs`.

**Output:**
- `typescript-eslint` at ^8.70.1 (its peer range `<6.1.0` accepts TS 6.0.x).
- `coffee-shop-api/eslint.config.mjs` is unchanged, unless an upgrade note requires a change.

**Acceptance Criteria:**

- [x] Lint prints no "unsupported TypeScript version" warning.
- [x] Lint passes with no new errors.
- [x] Every new warning is either fixed in source or listed in the phase commit message, with the
      reason for keeping it.
- [x] No rule is disabled or downgraded to get lint green.

**Verification:**

- Lint result is compared against `baseline.md`.
- The error count is the same or lower.

---

### Task 4: Replace `ts-node` with `tsx` in project scripts

**Description:**
- The MikroORM 7 CLI only detects the oxc, swc, tsx, jiti, tsimp and nub loaders, not `ts-node`.
- `ts-node` 10 is no longer maintained.
- Moving the project's scripts to `tsx` now gives Phase 2 a working TS runner.

**Input:**
- `coffee-shop-api/package.json` scripts:
  - `pretest:e2e` uses `ts-node --transpile-only` with `tsconfig-paths/register` to run
    `test/reset-test-db.ts`.
  - `test:debug` preloads `tsconfig-paths/register` and `ts-node/register`.
- `devDependencies` include `ts-node` and `tsconfig-paths`.

**Output:**
- `tsx` in `devDependencies`.
- `pretest:e2e` runs `test/reset-test-db.ts` through `tsx`.
- `test:debug` runs Jest in-band under the inspector with `tsx` as the TS loader.
- Neither script preloads `tsconfig-paths`, since the project defines no `paths`.
- `ts-node` and `tsconfig-paths` are removed from `devDependencies` once nothing references them.
  If the MikroORM 6 CLI still needs `ts-node`, the removal moves to Phase 2 and is noted in the
  phase commit message.

**Acceptance Criteria:**

- [x] `pretest:e2e` resets the test database before the e2e run, as it does today.
- [x] `test:debug` starts Jest paused for a debugger, and attaching a debugger lets the run
      continue.
- [x] No script in `package.json` references `ts-node` or `tsconfig-paths`.
- [x] The migration scripts behave as in the baseline:
  - `migration:up` reports no pending migrations on an up-to-date database.
  - `migration:create` reports no schema difference.
- [x] `ts-node` and `tsconfig-paths` are either gone from `devDependencies` or explicitly deferred
      to Phase 2, with the reason recorded.

**Verification:**

- The full e2e suite passes with the same counts as `baseline.md`. This exercises `pretest:e2e`
  through:
  - `CategoryController (e2e)`,
  - `ProductController (e2e)`,
  - `UserController auth (e2e)`,
  - `WebhookController (e2e)`,
  - `GlobalExceptionFilter (e2e)`.
