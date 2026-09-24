# NestJS v12 Upgrade — Phase 5: Full Verification & Docs — Task Doc

Parent spec: `specs/2026-09-24/nestjs-v12-upgrade/plan.md` (section 5, Phase 5).

## 1. Task Understanding

- This is the final phase. Phases 1–4 each checked only what their own changes touched. This phase
  checks the finished result as a whole: NestJS 12, MikroORM 7, TypeScript 6, `tsx`, and the
  Phase 4 refactor (4a–4c).
- It proves the API contract is intact:
  - Success responses of the user, category and product endpoints match the Phase 0 baseline
    exactly.
  - Error responses match too, except the deliberate product/variant/image error deltas from
    Phase 4c, Task 7 (C1).
- It runs the manual smoke checks that automated tests don't cover (real Clerk session, rate
  limit, Swagger, migrations CLI), and checks the Docker images.
- It updates the project docs that state old versions: `README.md` and `CLAUDE.md`.
- Out of this plan:
  - Testing the web deploy. Handled separately.

## 2. Desired Outcome (Checklist)

- [ ] Lint, build, unit and e2e pass. Test counts match or exceed the baseline.
- [ ] Every user, category and product response in the baseline matches, apart from the
      documented C1 deltas.
- [ ] All manual smoke checks pass, and their results are recorded.
- [ ] Dev and prod Docker images build and serve requests.
- [ ] `README.md` and `CLAUDE.md` state NestJS 12, MikroORM 7, TypeScript 6 and Node ≥ 24.15.

## 3. Input (current state)

- Phases 0–4 are complete.
- `coffee-shop-api/specs/2026-09-24/nestjs-v12-phase-0-prep-environment/baseline.md` holds the
  baseline:
  - test results;
  - error bodies;
  - success bodies for user, category and product.
- Phase 4c, Task 7 recorded the expected error-body deltas for product, variant and image.
- `coffee-shop-api/README.md`:
  - the tech stack table lists Node v24, TypeScript v5, NestJS v11 and MikroORM v6;
  - the prerequisites section says Node.js v24.
- `coffee-shop-api/CLAUDE.md`:
  - describes "a NestJS v11 backend";
  - refers to "`@nestjs/*` (v11) or MikroORM (v6) APIs".
- `coffee-shop-api/Dockerfile`, `docker-compose.yml` and `docker-compose.dev.yml` are driven by
  the `docker:dev` and `docker:prod` scripts.

## 4. Output (target state)

- `coffee-shop-api/specs/2026-09-24/nestjs-v12-phase-5-verification-docs/verification.md`,
  recording:
  - automated results next to the baseline;
  - the response comparison per endpoint;
  - each manual check with pass/fail;
  - the Docker results.
- `coffee-shop-api/README.md` and `coffee-shop-api/CLAUDE.md` updated. Only version facts change.

## Non-goals

- No functional code changes. A defect found here goes back to the phase that caused it and is
  fixed there.
- No deploy testing.

## Ordering

- Tasks 1–4 (verification) come before Task 5 (docs), so the docs describe a stack that's known to
  work.
- Task 2 needs the app running against the same seeded data used for the baseline.

---

## Task Checklist

- [ ] Task 1: Run the full automated suite and compare against the baseline
- [ ] Task 2: Verify user, category and product API responses against the baseline
- [ ] Task 3: Run the manual smoke checks
- [ ] Task 4: Verify the Docker dev and prod builds
- [ ] Task 5: Update project docs (`README.md`, `CLAUDE.md`)

---

### Task 1: Run the full automated suite and compare against the baseline

**Description:**
- Only a full run on the final code shows the upgrade and refactor phases work together.

**Input:**
- The finished branch.
- `baseline.md` from Phase 0.

**Output:**
- `verification.md` records lint, build, unit and e2e results next to the baseline numbers.

**Acceptance Criteria:**

- [ ] Lint, build, unit and e2e all pass.
- [ ] Unit and e2e test counts are equal to or greater than the baseline.
- [ ] No test is skipped, deleted or loosened. The only expectation changes are the Phase 4c,
      Task 7 ones.
- [ ] Any test that failed in the baseline is either still failing for the same pre-existing reason
      or now passing. No new failure appears.

**Verification:**

- Every unit spec under `coffee-shop-api/src/`, and every e2e suite in `coffee-shop-api/test/e2e/`:
  - `CategoryController (e2e)`,
  - `ProductController (e2e)`,
  - `UserController auth (e2e)`,
  - `WebhookController (e2e)`,
  - `GlobalExceptionFilter (e2e)`.

---

### Task 2: Verify user, category and product API responses against the baseline

**Description:**
- The e2e suites assert selected fields. This task compares **complete** response bodies, so a
  renamed, dropped or re-typed field can't slip through: status code, every field, value types,
  `meta`, and the `{ data }` envelope.

**Input:**
- The success and error bodies captured in `baseline.md` (Phase 0, Task 1) for:
  - Category: list, get by id, create, update, delete.
  - Product: list (plain, filtered, sorted), get by id with images and variants, create with
    images and variants, update, delete.
  - User: list, get by id, `GET /me`, update, delete.
  - Errors: 400, 401, 403, 404, 409.
- The C1 deltas recorded in Phase 4c, Task 7.

**Output:**
- `verification.md` holds a table with one row per captured request: route, scenario, status,
  and match / expected delta / mismatch.
- Any mismatch that is not a documented C1 delta is traced back to the phase that caused it, and
  fixed there.

**Acceptance Criteria:**

- [ ] Every success body matches the baseline field for field. Generated values (ids,
      timestamps) are compared by presence and type, not by value.
- [ ] Every error body matches the baseline, except the product/variant/image 404 and 409 bodies.
      Those match the Phase 4c, Task 7 deltas exactly.
- [ ] No unexpected mismatch remains.

**Verification:**

- Manual comparison of captured bodies. Record the results in `verification.md`.
- The automated counterparts ran in Task 1:
  - `CategoryController (e2e)`,
  - `ProductController (e2e)`,
  - `UserController auth (e2e)`.

---

### Task 3: Run the manual smoke checks

**Description:**
- Some behavior crosses real external boundaries or configuration that the e2e suites stub or
  don't exercise: a real Clerk session, the Swagger UI, rate limiting, the migration CLI.
- These are checked once, by hand, on the running app.

**Input:**
- The app running in dev mode against the dev database, with valid `.env` values:
  - Clerk keys;
  - the webhook secret.

**Output:**
- `verification.md` lists each check below with its pass/fail result and any notes.

**Acceptance Criteria:**

- [ ] `/docs` loads and lists all routes. Bearer auth and 401/403 docs appear on the admin routes
      only.
- [ ] A Clerk-protected route (`GET /api/v1/users/me`) returns 200 with a real Clerk session.
- [ ] An ADMIN-only route (`POST /api/v1/categories`) returns 201 for an ADMIN and 403 for a
      regular user.
- [ ] Exceeding the rate limit returns 429.
- [ ] A Clerk webhook delivery (from the Clerk dashboard test event or a signed replay) is accepted
      at `POST /webhooks/clerk`, and the local user is created or updated.
- [ ] `migration:up` reports nothing pending, and `migration:create` reports no schema difference
      on the dev database.

**Verification:**

- Manual, as listed in the Acceptance Criteria.

---

### Task 4: Verify the Docker dev and prod builds

**Description:**
- The container images run `node dist/main` on `node:24-alpine`.
- They must build with the new lockfile and run the ESM-only v12 packages from a CommonJS build.

**Input:**
- `coffee-shop-api/Dockerfile` with its `deps`, `development`, `build` and `production` stages.
- `docker-compose.yml`, `docker-compose.dev.yml`, `.env.docker`.
- The `docker:dev`, `docker:dev:down`, `docker:prod`, `docker:prod:down` scripts.

**Output:**
- `verification.md` records the results for both stacks.

**Acceptance Criteria:**

- [ ] The dev stack builds, the app container becomes healthy after Postgres, and a public route
      responds 200.
- [ ] The prod stack builds, the production image starts `node dist/main`, a public route responds
      200, and `/docs` is not served.
- [ ] Neither container logs an ESM loading error (e.g. `ERR_REQUIRE_ASYNC_MODULE`) at startup.
- [ ] The Postgres healthcheck dependency (`condition: service_healthy`) is still in place.

**Verification:**

- Manual, as listed in the Acceptance Criteria.

---

### Task 5: Update project docs (`README.md`, `CLAUDE.md`)

**Description:**
- The README and CLAUDE.md are the first things a developer or agent reads.
- They currently state NestJS v11, MikroORM v6 and TypeScript v5 as the stack.

**Input:**
- `coffee-shop-api/README.md`:
  - the tech stack table, which lists Node v24, TypeScript v5, NestJS v11 and MikroORM v6;
  - the prerequisites section, which says Node.js v24.
- `coffee-shop-api/CLAUDE.md`:
  - the "Project state" paragraph ("a NestJS v11 backend");
  - the note preferring "`@nestjs/*` (v11) or MikroORM (v6) APIs".

**Output:**
- `README.md`:
  - the tech stack shows TypeScript v6, NestJS v12 and MikroORM v7;
  - the Node requirement states ≥ 24.15.
- `CLAUDE.md` names NestJS v12 and MikroORM v7 in both places.

**Acceptance Criteria:**

- [ ] Neither file names NestJS 11, MikroORM 6 or TypeScript 5 as the current stack.
- [ ] The README's Node requirement matches `engines.node` in `package.json`.
- [ ] Only version facts and directly affected sentences change. No unrelated rewording.

**Verification:**

- The only stack versions left in the README and CLAUDE.md match `package.json`.
