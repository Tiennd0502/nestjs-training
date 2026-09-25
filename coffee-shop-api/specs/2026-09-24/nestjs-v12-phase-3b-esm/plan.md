# NestJS v12 Upgrade — Phase 3b: Move the Project to ESM — Task Doc

Parent spec: `specs/2026-09-24/nestjs-v12-upgrade/plan.md` (sections 5 and 7, Phase 3).
Phase overview: `specs/2026-09-24/nestjs-v12-phase-3-nestjs-12/plan.md`.
References:
- [NestJS migration guide](https://docs.nestjs.com/migration-guide): "Switching your project to
  ESM", "Moving your own code to ESM", "Testing stack".
- [NestJS SWC recipe](https://docs.nestjs.com/recipes/swc): Vitest section.

## 1. Task Understanding

- Second of the three Phase 3 plans, after 3a (upgrade) and before 3c (v12 features).
- NestJS 12 ships every core package as ESM. After Phase 3a the app is on Nest 12 but still
  CommonJS, loading Nest through Node's `require(esm)`. This plan moves the project itself to
  ESM.
- Per the migration guide, the switch is the `"type": "module"` field in `package.json`.
  `tsconfig.json` already uses `nodenext`, so no compiler option changes are needed. Every
  relative import must then carry a `.js` extension, fixed in the same pass.
- Project-specific CommonJS-only files are also fixed. The guide doesn't list these:
  - `commitlint.config.js`: if it isn't fixed, Husky blocks every commit.
  - `test/setup-env.js`.
  - The JSON import in `swagger.config.ts`.
  - `eslint.config.mjs`.
  - The production entry.
- Tests move from Jest to Vitest, the guide's default for ESM projects:
  - Jest's own docs mark its ESM support as experimental.
  - Under Jest's ESM mode, `jest.mock`, which the project uses for `@clerk/express` and `svix` in
    6 places including every auth e2e suite, stops working and must be rewritten to
    `jest.unstable_mockModule`.
  - Vitest is built with SWC, so decorator metadata survives for Nest DI.
- The API contract doesn't change. Every response body must still match the baseline.

## 2. Desired Outcome (Checklist)

- [ ] `package.json` declares `"type": "module"`, and the build emits ESM.
- [ ] No relative import lacks a file extension. No `require`, `module.exports`, `__dirname` or
      `__filename` remains outside a deliberate `.cjs` file.
- [ ] Commits still pass the Husky `commit-msg` hook.
- [ ] Unit and e2e tests run on Vitest with the same counts and titles as on Jest.
- [ ] `start:dev`, `start:prod`, the MikroORM CLI, Docker and CI all work on the ESM build.
- [ ] Baseline response bodies are unchanged.

## 3. Input (current state)

- Phase 3a is complete: NestJS 12 on CommonJS, all tests green on Jest.
- `coffee-shop-api/package.json` has no `type` field. Tests run on Jest + `ts-jest` (a `jest`
  block for unit tests, and `test/jest-e2e.json` for e2e).
- `coffee-shop-api/tsconfig.json`: `module`/`moduleResolution` `nodenext`,
  `resolvePackageJsonExports`, `esModuleInterop`, `isolatedModules`, `types: ["node", "jest"]`.
- 325 relative import lines across 95 files in `src/` and `test/`, all without extensions.
- CommonJS-only constructs:
  - `commitlint.config.js` (`module.exports`);
  - `test/setup-env.js` (`require`, `__dirname`);
  - named JSON import in `src/configs/swagger.config.ts`;
  - `eslint.config.mjs` (`sourceType: 'commonjs'`, `globals.jest`).
- Jest APIs in 17 spec files, including 6 `jest.mock` calls for `@clerk/express` and `svix`.

## 4. Output (target state)

- `package.json` has `"type": "module"`, and every relative import carries a `.js` extension.
- `commitlint.config.js`, the test env setup file, `swagger.config.ts`, `eslint.config.mjs`,
  `main.ts`, `start:prod` and the Dockerfile `CMD` are ESM-valid.
- Vitest (with `unplugin-swc`) replaces Jest:
  - `vitest.config.ts` and `vitest.config.e2e.ts`;
  - updated scripts and specs;
  - `jest`, `ts-jest`, `@types/jest`, the `jest` block and `test/jest-e2e.json` removed.
- `nest-cli.json` and `tsconfig.build.json` are unchanged. The guide states they are identical in
  CommonJS and ESM projects.

## Non-goals

- No oxlint and no Rspack. Linting stays on ESLint, and the build stays on `nest build` (tsc).
- No `tsconfig.json` compiler option changes beyond the test runner `types` entry.
- No behavior change and no new features.

## Ordering

- Tasks 1, 2 and 3 are one logical change: the build and tests only pass again once all three
  land. They may be separate commits, but are verified together in Task 4.
- Phase 3c starts only after Task 4 passes, so new code is written as ESM from the start.

---

## Task Checklist

- [ ] Task 1: Switch the project to ESM and add import extensions
- [ ] Task 2: Replace CommonJS-only constructs
- [ ] Task 3: Move the test suites from Jest to Vitest
- [ ] Task 4: Verify the ESM build end to end

---

### Task 1: Switch the project to ESM and add import extensions

**Description:**
- v12 ships every core package as ESM. The project adopts the same module format, so it no longer
  depends on Node's `require(esm)` bridge to load Nest.
- Per the migration guide ("Switching your project to ESM"), the switch is the `"type": "module"`
  field in `package.json`. `tsconfig.json` already uses `module`/`moduleResolution` `nodenext`,
  so TypeScript then emits every file as ESM.
- The guide warns that the switch makes TypeScript report every relative import without a file
  extension. Those must all be fixed in the same pass, not incrementally.

**Input:**
- `coffee-shop-api/package.json`, which has no `type` field.
- `coffee-shop-api/tsconfig.json`: `module`/`moduleResolution` `nodenext`,
  `resolvePackageJsonExports`, `esModuleInterop`, `isolatedModules`, `rootDir: ./src`.
- 325 relative import lines across 95 files in `src/` and `test/`, all without extensions. This
  includes the side-effect import `import './setup-env'` in `test/reset-test-db.ts`.
- Default imports of CommonJS packages: `helmet` in `src/main.ts`, `slugify` in
  `src/common/utils/slug.util.ts`.
- MikroORM migrations in `src/migrations/` (relative imports, if any, are included in the count
  above).

**Output:**
- `package.json` declares `"type": "module"`.
- Every relative import and export in `src/` and `test/` carries the `.js` extension of the
  emitted file, as the guide shows (`./app.module.js`).
- `tsconfig.json` keeps its current compiler options.
- `nest-cli.json` and `tsconfig.build.json` are unchanged. The guide states they are identical in
  CommonJS and ESM projects.
- Default imports of CommonJS packages keep working through `esModuleInterop`. Any that don't are
  switched to the form the package documents for ESM.

**Acceptance Criteria:**

- [ ] `package.json` has `"type": "module"`.
- [ ] Build passes with no missing-extension or module-resolution errors.
- [ ] `dist/` contains ESM output (`import`/`export`, no `require`/`module.exports`).
- [ ] No relative import in `src/` or `test/` lacks a file extension.
- [ ] `helmet` and `slugify` behave as before: security headers are present on responses, and
      slugs are generated identically.

**Verification:**

- Build succeeds, and a spot check of `dist/main.js` and one module file shows ESM syntax.
- `src/common/utils/slug.util.spec.ts` passes. It runs under Vitest after Task 3; until then, the
  build is the check.
- The full unit and e2e suites pass after Task 3 lands. Tasks 1–3 are one logical change and are
  verified together.

---

### Task 2: Replace CommonJS-only constructs

**Description:**
- Once `"type": "module"` is set, every `.js` file in the package is loaded as ESM, and
  `require`, `module.exports`, `__dirname` and `__filename` stop existing.
- Named imports from a JSON file are also not valid in ESM. JSON needs an import attribute and a
  default import.
- The guide covers `__dirname` and `require` in general terms. This task applies it to the
  project's specific files, including config files the guide doesn't mention.

**Input:**
- `coffee-shop-api/commitlint.config.js`, which uses `module.exports`. Husky's `commit-msg` hook
  loads it, so every commit fails if it doesn't load.
- `coffee-shop-api/test/setup-env.js`, which uses `require('node:path')`, `require('dotenv')`
  and `__dirname` to load `.env.test`.
- `coffee-shop-api/src/configs/swagger.config.ts`, which does a named import of `name`,
  `description` and `version` from `../../package.json`.
- `coffee-shop-api/eslint.config.mjs`, with `sourceType: 'commonjs'` and `globals.jest`.
- `coffee-shop-api/src/main.ts`, which calls `bootstrap()` without awaiting it.
- The `start:prod` script and the production `CMD` in `coffee-shop-api/Dockerfile`, which both run
  `node dist/main` without an extension.

**Output:**
- `commitlint.config.js` exports its config in ESM form. Alternatively it is renamed to a `.cjs`
  file, if commitlint documents that as the supported option.
- The test env setup is ESM. It resolves `.env.test` through `import.meta.dirname` and loads
  `dotenv` through an import. It can be converted to TypeScript, or kept as ESM JavaScript.
- `swagger.config.ts` reads the package metadata through a default JSON import with the
  `with { type: 'json' }` attribute. Alternatively it reads it through another ESM-valid
  mechanism that keeps `dist/` layout unchanged.
- `eslint.config.mjs` uses `sourceType: 'module'`, and its globals match the test runner from
  Task 3.
- `main.ts` awaits `bootstrap()` at the top level, as the guide's ESM samples do. Its
  unhandled-promise behavior is unchanged.
- `start:prod` and the Dockerfile `CMD` point at an entry that Node's ESM loader resolves. The
  extension is added if the extensionless form fails.

**Acceptance Criteria:**

- [ ] A commit on the branch passes the Husky `commit-msg` hook, and commitlint still enforces
      Conventional Commits.
- [ ] `pretest:e2e` still loads `.env.test` before the MikroORM config reads `process.env`.
- [ ] `/docs` still shows the API title, description and version from `package.json`.
- [ ] Lint passes with no new errors.
- [ ] `start:prod` and the production Docker image boot the app.
- [ ] No `require(`, `module.exports`, `__dirname` or `__filename` remains in `src/`, `test/` or
      root config files, except inside a deliberate `.cjs` file.

**Verification:**

- Manual: make a commit with a valid message and one with an invalid message. The hook accepts
  the first and rejects the second.
- Manual: `/docs` header matches the Phase 3a, Task 4 check.
- `start:prod` boots locally. The Docker prod image is checked again in Phase 5, Task 4.

---

### Task 3: Move the test suites from Jest to Vitest

**Description:**
- Jest's ESM support is still experimental and needs extra Node flags.
- The migration guide makes Vitest the default for ESM projects, and the NestJS SWC recipe
  documents the Vitest setup.
- Vitest's default esbuild transform does **not** emit decorator metadata, and Nest DI depends on
  `emitDecoratorMetadata`. The recipe therefore builds test files with SWC (`unplugin-swc`).
  Without it, every `TestingModule` fails to resolve dependencies.

**Input:**
- The `package.json` `jest` block (unit: `rootDir: src`, `*.spec.ts`, `ts-jest`).
- `test/jest-e2e.json` (e2e: `*.e2e-spec.ts`, `setupFiles: setup-env.js`, `ts-jest`).
- Scripts in `package.json`: `test`, `test:watch`, `test:cov`, `test:debug`, `test:e2e`
  (`--runInBand`), and `pretest:e2e`.
- Jest APIs in 17 spec files: `jest.fn` (65), `jest.Mock` type (60), `jest.clearAllMocks` (10),
  `jest.mock` (6), `jest.requireActual` (3), `jest.spyOn` (3), `jest.SpyInstance` (1),
  `jest.restoreAllMocks` (1).
- `tsconfig.json` `types: ["node", "jest"]`.
- devDependencies `jest`, `ts-jest`, `@types/jest`.
- e2e files already use default `supertest` imports (`import request from 'supertest'`), which is
  what the recipe requires.
- `.github/workflows/ci.yml`, which runs the `test` script.

**Output:**
- devDependencies: `vitest`, `unplugin-swc`, `@swc/core`, `@vitest/coverage-v8` added; `jest`,
  `ts-jest`, `@types/jest` removed.
- A unit config (`vitest.config.ts`) and an e2e config (`vitest.config.e2e.ts`) at the project
  root, following the SWC recipe:
  - globals on;
  - the SWC plugin;
  - unit tests from `src/**/*.spec.ts`, e2e tests from `test/**/*.e2e-spec.ts`;
  - the e2e config runs the Task 2 env setup file first, and runs files sequentially (no file
    parallelism), because suites share one Postgres database.
- Scripts follow the recipe:
  - `test` → `vitest run`;
  - `test:watch` → `vitest`;
  - `test:cov` → `vitest run --coverage`;
  - `test:debug` → `vitest --inspect-brk --no-file-parallelism`;
  - `test:e2e` → `vitest run --config ./vitest.config.e2e.ts`.
  - `pretest:e2e` keeps resetting the test DB through `tsx`.
- Every spec uses the Vitest equivalents of the Jest APIs: `vi.fn`, `vi.mock`, `vi.spyOn`,
  `vi.clearAllMocks`, `vi.restoreAllMocks`, the Vitest `Mock` type, and `vi.importActual` in
  place of `jest.requireActual`. `vi.importActual` is async, so the three call sites are adjusted.
- `tsconfig.json` `types` becomes `["vitest/globals", "node"]`, as in the guide's generated ESM
  project.
- The `package.json` `jest` block and `test/jest-e2e.json` are deleted.
- Coverage still writes to `coverage/`.

**Acceptance Criteria:**

- [ ] Unit and e2e test counts are equal to the Jest counts before the switch. No test is
      skipped, deleted or loosened.
- [ ] Every test title is unchanged, so later phases can still reference them by name.
- [ ] No `jest.` reference remains in `src/` or `test/`.
- [ ] DI resolves in every `TestingModule`, which confirms decorator metadata is emitted.
- [ ] e2e suites run sequentially against the test database and pass twice in a row.
- [ ] `test:cov` produces a coverage report.
- [ ] `test:debug` starts paused for a debugger.
- [ ] The CI `test` step passes on the branch.

**Verification:**

- The full unit suite passes under Vitest, with the same count as the last Jest run. This
  includes every spec named in Phase 3a, Tasks 1–4.
- The full e2e suite passes under Vitest:
  - `CategoryController (e2e)`,
  - `ProductController (e2e)`,
  - `UserController auth (e2e)`,
  - `WebhookController (e2e)`,
  - `GlobalExceptionFilter (e2e)`.
- The CI run for the branch is green.

---

### Task 4: Verify the ESM build end to end

**Description:**
- Tasks 1–3 change how every file is emitted, loaded and tested.
- Before any new feature lands on top, this task confirms that each way the app runs still
  works.

**Input:**
- The branch after Tasks 1–3.
- The run paths:
  - `start:dev` (watch);
  - `start:prod`;
  - `pretest:e2e` and the MikroORM CLI (through `tsx`);
  - Docker dev and prod images;
  - CI.

**Output:**
- The results of the checks below, recorded in the phase commit message.

**Acceptance Criteria:**

- [ ] `start:dev` boots and rebuilds on a source change, and the Swagger compiler plugin still
      populates the OpenAPI schema.
- [ ] `start:prod` boots from `dist/`.
- [ ] `migration:up` reports nothing pending, and `migration:create` reports no schema
      difference, run through `tsx` on the ESM config.
- [ ] Both Docker images build and serve a public route, with no module loading errors in the
      logs.
- [ ] The baseline 400/401/403/404/409 bodies still match (same check as Phase 3a, Task 3).
- [ ] CI is green.

**Verification:**

- Manual checks, as described in the Acceptance Criteria.
- The full unit and e2e suites under Vitest.
- The Phase 3a, Task 3 e2e cases, re-run, with bodies compared against `baseline.md`.
