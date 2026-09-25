# NestJS v12 Upgrade — Phase 0: Prep & Environment — Task Doc

Parent spec: `specs/2026-09-24/nestjs-v12-upgrade/plan.md` (section 5, Phase 0).

## 1. Task Understanding

- First phase of the NestJS 11 → 12 upgrade. It changes no application code; it gets the ground
  ready so later phases can be judged against a known starting point.
- It records a **baseline**: the current lint/build/unit/e2e results, and the exact bodies of the
  user, category and product responses, both success and error. The later phases must show that
  API behavior is unchanged, which can only be proven by comparing against this baseline. The
  baseline also separates failures that already exist from failures caused by the upgrade. Phase
  5 compares against it to verify the user, category and product API responses.
- It **pins the Node version** to ≥ 24.15. That is the highest minimum among the new stack:
  - NestJS 12 needs Node ≥ 20.19 to run apps.
  - Jest can only load the ESM-only v12 packages on Node ≥ 24.9.
  - MikroORM 7 needs Node ≥ 22.17.
  - `@nestjs/schematics` 12 needs Node ≥ 24.15.
- Every environment already runs Node 24, but none of them enforces a minor version:
  - Local: 24.19.
  - Docker: `node:24-alpine`.
  - CI (`.github/workflows/ci.yml`, at the git repo root): `node-version: 24`.

## 2. Desired Outcome (Checklist)

- [ ] Work happens on a dedicated upgrade branch cut from `feat/coffee-shop-api`.
- [ ] A baseline record exists with current lint/build/unit/e2e results and the full user,
      category and product response bodies (success and error).
- [ ] `package.json` declares the minimum Node version, and a Node version file exists for local
      tooling.
- [ ] CI and Docker are confirmed to run Node ≥ 24.15.

## 3. Input (current state)

- Branch `feat/coffee-shop-api`, with uncommitted changes in `coffee-shop-api/.gitignore` and an
  untracked `coffee-shop-api/.env.test`.
- `coffee-shop-api/package.json` has no `engines` field. There is no `.nvmrc`.
- `coffee-shop-api/Dockerfile` sets `ARG NODE_VERSION=24-alpine`.
- `.github/workflows/ci.yml` runs lint, unit tests and build on `node-version: 24`. It does not
  run e2e.
- Error responses come from `GlobalExceptionFilter`
  (`coffee-shop-api/src/common/filters/global-exception.filter.ts`) with the envelope
  `statusCode` / `message` / `errors[]`.

## 4. Output (target state)

- A new branch `feat/upgrade-nestjs-v12`.
- `coffee-shop-api/specs/2026-09-24/nestjs-v12-phase-0-prep-environment/baseline.md`, holding:
  - the test results,
  - the captured success and error bodies.
- `coffee-shop-api/package.json` with an `engines.node` constraint of `>=24.15`.
- `coffee-shop-api/.nvmrc` naming Node 24.
- `.github/workflows/ci.yml` resolving a Node version ≥ 24.15.

## Non-goals

- No dependency version changes. Those start in Phase 1.
- No new CI jobs (e.g. adding e2e to CI).

## Ordering

- Task 1 comes first, because the baseline must be taken on untouched code.
- Tasks 2 and 3 are independent of each other.

---

## Task Checklist

- [ ] Task 1: Create the upgrade branch and record the baseline
- [ ] Task 2: Pin the Node version in the project
- [ ] Task 3: Align CI and Docker with the pinned Node version

---

### Task 1: Create the upgrade branch and record the baseline

**Description:**
- Later phases change the toolchain, the ORM and the framework, and refactor the code.
- Without a record of how things behave today, we can't tell a regression from a failure that
  already existed, or prove that the user, category and product responses are unchanged.

**Input:**
- The current `feat/coffee-shop-api` working tree, including the pending `.gitignore` change and
  `.env.test`.
- The e2e suites in `coffee-shop-api/test/e2e/`.

**Output:**
- Pending changes are committed or stashed, so the new branch starts clean.
- A new branch `feat/upgrade-nestjs-v12`.
- `baseline.md` in this plan's folder, recording:
  - Lint, build, unit and e2e results, with test counts and any failing test named.
  - The full status and JSON body of these success responses, run against a fixed seeded
    dataset:
    - Category: list, get by id, create, update, delete (as ADMIN).
    - Product: list (plain, filtered by category, sorted by price), get by id with images and
      variants, create with images and variants, update, delete (as ADMIN).
    - User: list and get by id (as ADMIN), `GET /api/v1/users/me` (as a regular user), update,
      delete (as ADMIN).
  - The full JSON bodies of these error responses:
    - 400: invalid category name on `POST /api/v1/categories` as ADMIN.
    - 401: `GET /api/v1/users` with a Clerk session but no matching local user.
    - 403: `POST /api/v1/categories` as a non-ADMIN user.
    - 404: `GET /api/v1/products/:id` for a missing id.
    - 409: duplicate product name on `POST /api/v1/products`.

**Acceptance Criteria:**

- [ ] The branch exists and starts from the latest `feat/coffee-shop-api`.
- [ ] `baseline.md` lists the result of each of the four checks (lint, build, unit, e2e).
- [ ] Any test that already fails is named in `baseline.md`, marked as pre-existing.
- [ ] `baseline.md` contains every listed success body and the five error bodies verbatim, each
      labeled with its route, caller role and scenario.
- [ ] The seeded dataset used for the capture is described in `baseline.md`, so Phase 5 can
      reproduce it.

**Verification:**

- The five bodies match what these existing e2e tests produce:
  - 400: `CategoryController (e2e)` → `mutating routes with an authenticated ADMIN user` →
    `POST /categories responds 400 with field-level errors for an invalid name`.
  - 401: `UserController auth (e2e)` → `Clerk session with no matching local user` →
    `GET /users responds 401`.
  - 403: `CategoryController (e2e)` → `mutating routes with an authenticated non-ADMIN user` →
    `POST /categories responds 403`.
  - 404: `ProductController (e2e)` → `public GET routes` →
    `GET /products/:id responds 404 for a missing product`.
  - 409: `ProductController (e2e)` → `mutating routes with an authenticated ADMIN user` →
    `POST /products responds 409 for a duplicate name`.

---

### Task 2: Pin the Node version in the project

**Description:**
- The v12 stack has hard Node minimums.
- The strictest is ≥ 24.15, from `@nestjs/schematics` 12.
- Without it, Jest fails with `ERR_REQUIRE_ASYNC_MODULE` on Node < 24.9.
- Declaring the minimum makes pnpm warn about a wrong Node before anything confusing fails.

**Input:**
- `coffee-shop-api/package.json`, which has no `engines` field.
- No Node version file in `coffee-shop-api/`.

**Output:**
- `coffee-shop-api/package.json` declares `engines.node` as `>=24.15`.
- `coffee-shop-api/.nvmrc` names Node major version 24.

**Acceptance Criteria:**

- [ ] `package.json` has an `engines.node` field of `>=24.15`.
- [ ] `.nvmrc` exists in `coffee-shop-api/` and names Node 24.
- [ ] Install, lint, build and unit tests still pass on local Node 24.19.

**Verification:**

- The full unit suite passes unchanged, with the same counts as `baseline.md`.

---

### Task 3: Align CI and Docker with the pinned Node version

**Description:**
- CI and Docker must run a Node version that meets the new minimum.
- Otherwise the upgrade passes locally and fails in the pipeline or the container.

**Input:**
- `.github/workflows/ci.yml` (repo root), with `node-version: 24` in the setup-node step.
- `coffee-shop-api/Dockerfile`, with `ARG NODE_VERSION=24-alpine`.

**Output:**
- `.github/workflows/ci.yml` resolves Node ≥ 24.15. Either it reads `coffee-shop-api/.nvmrc`, or
  it states a version that cannot resolve below 24.15.
- `coffee-shop-api/Dockerfile` either stays on `24-alpine` (after confirming the image tag resolves
  to ≥ 24.15) or pins a specific 24.x tag ≥ 24.15.

**Acceptance Criteria:**

- [ ] A CI run on the upgrade branch logs a Node version ≥ 24.15.
- [ ] The Docker base image used by `docker-compose.yml` reports a Node version ≥ 24.15.
- [ ] CI's lint, test and build steps pass on the branch.

**Verification:**

- The CI run for the branch shows the Node version in its setup step, and all steps are green.
- The Node version inside the built dev container is ≥ 24.15.
