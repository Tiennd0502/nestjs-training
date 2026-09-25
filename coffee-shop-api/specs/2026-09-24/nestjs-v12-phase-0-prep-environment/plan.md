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
- It confirms the **Node version**. The stack needs Node 24 or later; nothing is pinned:
  - NestJS 12 needs Node ≥ 20.19 to run apps.
  - Jest can only load the ESM-only v12 packages on Node ≥ 24.9.
  - MikroORM 7 needs Node ≥ 22.17.
  - `@nestjs/schematics` 12 needs Node ≥ 24.15.
- Every environment already runs Node 24, and each resolves to the newest 24.x, which meets all
  the minimums above:
  - Local: 24.19.
  - Docker: `node:24-alpine` (24.21 at the time of writing).
  - CI (`.github/workflows/ci.yml`, at the git repo root): `node-version: 24`.

## 2. Desired Outcome (Checklist)

- [x] Work happens on a dedicated upgrade branch cut from `feat/coffee-shop-api`.
- [x] A baseline record exists with current lint/build/unit/e2e results and the full user,
      category and product response bodies (success and error).
- [ ] CI and Docker are confirmed to run Node 24 or later.

## 3. Input (current state)

- Branch `feat/coffee-shop-api`, with uncommitted changes in `coffee-shop-api/.gitignore` and an
  untracked `coffee-shop-api/.env.test`.
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
- No project file changes for the Node version. It is only confirmed.

## Non-goals

- No dependency version changes. Those start in Phase 1.
- No new CI jobs (e.g. adding e2e to CI).

## Ordering

- Task 1 comes first, because the baseline must be taken on untouched code.

---

## Task Checklist

- [x] Task 1: Create the upgrade branch and record the baseline
- [ ] Task 2: Confirm the Node version in CI and Docker

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

- [x] The branch exists and starts from the latest `feat/coffee-shop-api`.
- [x] `baseline.md` lists the result of each of the four checks (lint, build, unit, e2e).
- [x] Any test that already fails is named in `baseline.md`, marked as pre-existing.
- [x] `baseline.md` contains every listed success body and the five error bodies verbatim, each
      labeled with its route, caller role and scenario.
- [x] The seeded dataset used for the capture is described in `baseline.md`, so Phase 5 can
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

### Task 2: Confirm the Node version in CI and Docker

**Description:**
- The v12 stack needs Node 24 or later. Nothing is pinned.
- This task only confirms that CI and Docker already meet it, so the upgrade doesn't pass locally
  and fail in the pipeline or the container.

**Input:**
- `.github/workflows/ci.yml` (repo root), with `node-version: 24` in the setup-node step.
- `coffee-shop-api/Dockerfile`, with `ARG NODE_VERSION=24-alpine`.

**Output:**
- No file changes are expected. If either resolves below Node 24, the affected file is changed
  to Node 24.

**Acceptance Criteria:**

- [x] The Docker base image used by `docker-compose.yml` reports Node 24 or later.
- [ ] A CI run on the upgrade branch logs Node 24 or later.
- [ ] CI's lint, test and build steps pass on the branch.

**Verification:**

- The CI run for the branch shows the Node version in its setup step, and all steps are green.
- The Node version inside the built dev container is 24 or later.
