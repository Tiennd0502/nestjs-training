---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code
---

# Writing Plans

## Overview

Write comprehensive implementation plans for **nestjs-example** (NestJS + TypeScript + MikroORM +
PostgreSQL + class-validator + Jest). Assume the engineer knows TypeScript/NestJS well but is
unfamiliar with this specific codebase. Plans are spec-first: describe _what_ must be true when a
task is done (named files, named artifacts, pass/fail Acceptance Criteria) — never _how_ to type
it. No code, no bash commands inside a task; the implementing step writes the code via TDD. DRY.
YAGNI.

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**Save plans to:** `specs/YYYY-MM-DD/<feature-name>/plan.md` at the repository root — this is
enforced by `.claude/execution/auto-flow.md`: Plan Mode writes into `specs/` (via
`plansDirectory` in `.claude/settings.json`), then gets moved/renamed into this exact path before
Confirm.

---

## Architecture Constraints (always enforce)

Every plan MUST follow these rules from `.claude/rules/coding.md`:

| Rule              | Detail                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| Layer discipline   | Controller → Service → MikroORM repository → PostgreSQL. No logic leaking across layers                    |
| Controller         | Parses a `class-validator` DTO (via global `ValidationPipe`), calls the service, returns its result. No business logic, no direct repository/`EntityManager` access |
| Persistence        | Service injects `EntityRepository<Entity>` via `@InjectRepository(Entity)`; entities registered per module with `MikroOrmModule.forFeature([Entity])`. Persist with `em.persistAndFlush(entity)`/`em.flush()` — MikroORM's unit-of-work, never a TypeORM-style `.save()` |
| Entities           | `@Entity()` class with `@PrimaryKey()`/`@Property()` fields — no business logic inside entities             |
| Validation         | DTOs as classes in `<domain>.dto.ts` using `class-validator` decorators (`@IsEmail()`, `@MinLength()`, ...)  |
| Error handling     | NestJS built-in exceptions only (`NotFoundException`, `BadRequestException`, `UnauthorizedException`, `ConflictException`, ...) from `@nestjs/common` — no custom `AppError` class |
| Auth               | `passport-jwt` `Strategy` + `@nestjs/jwt` `JwtService` for tokens, `bcrypt` for password hashing, `AuthGuard('jwt')` to protect routes |

---

## Scope Check

If the spec covers multiple independent domains, split into separate plans — one per domain. Each
plan must produce working, independently testable software.

---

## File Structure

No File Overview table — the Tasks section already shows which files are touched. Follow domain
naming from `.claude/rules/coding.md`:

| Type       | Convention                | Example              |
| ---------- | -------------------------- | ---------------------- |
| Entity     | `<domain>.entity.ts`       | `user.entity.ts`       |
| DTO        | `<domain>.dto.ts`          | `auth.dto.ts`          |
| Service    | `<domain>.service.ts`      | `auth.service.ts`      |
| Controller | `<domain>.controller.ts`   | `auth.controller.ts`   |
| Module     | `<domain>.module.ts`       | `auth.module.ts`       |
| Unit test  | `src/<domain>.spec.ts` (co-located with source) | `src/auth/auth.service.spec.ts` |
| E2E test   | `test/<domain>.e2e-spec.ts` | `test/auth.e2e-spec.ts` |

---

## Plan Document Header

**Every plan MUST start with this structure**:

```markdown
# <Feature Name> — Task Doc

## 1. Task Understanding

- prose bullets: what this changes, why, scope boundary — no code

## 2. Desired Outcome (Checklist)

- [ ] flat "done" checklist for the whole plan

## 3. Input (current state)

- prose bullets: existing files/behavior this plan starts from, named by path

## 4. Output (target state)

- prose bullets or table: target files/structure once the plan lands

## Non-goals

- prose bullets: explicitly excluded scope (only if there's real ambiguity to rule out)

## Ordering

- prose: dependency/sequencing constraints between tasks (only if tasks aren't independent)

---

## Task Checklist

- [ ] Task 1: <title>
- [ ] Task N: <title>
```

---

## Task Structure

Each task maps to one file or one logical unit, written spec-first — what must be true when it's
done, not how to type it. No fenced code blocks and no bash commands inside a task; the
implementer writes the actual code via TDD during execution, not here.

```markdown
### Task N: <Title>

**Description:** why this task exists — the problem being fixed, in prose.

**Input:** the current state this task starts from (files, existing behavior/duplication) — named
by file path, no code.

**Output:** the artifact(s) that must exist when this task is done (new method signature/purpose,
migrated call sites) — named, not coded.

**Acceptance Criteria:**

- [ ] flat bullet, independently checkable, no implementation detail
- [ ] ...

**Verification:**

- existing test case(s) that already cover this behavior, named by `describe`/`it` title and file
  — updated in place if the call path changes but the assertion doesn't
- new test case description (only where an Input note calls out a real coverage gap) — what's
  asserted, not the test code
```

---

## Test Design Rules

Unit tests co-located with source under `src/` (`*.spec.ts`); e2e tests in `test/`
(`*.e2e-spec.ts`), booting the full `AppModule` via `Test.createTestingModule` + `app.init()` and
`supertest` (per `CLAUDE.md`). Every test file MUST cover:

- **Happy path** — correct input, expected output
- **Error path** — not found, conflict, validation failure
- **Edge cases** — null fields, empty arrays, boundary values

Mock setup pattern (MikroORM, not TypeORM):

```typescript
const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
};

const mockEm = {
  persistAndFlush: jest.fn(),
  flush: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});
```

Never hit a real database — mock the injected `EntityRepository`/`EntityManager`.

---

## Migration Task Template

MikroORM is not yet installed in this project, so its CLI flags aren't verified here. Once
installed, confirm the exact commands against `npx mikro-orm --help` before relying on them in a
plan (do not assume TypeORM's `migration:create`/`migration:run` syntax carries over — MikroORM's
CLI differs).

---

## API Endpoint Documentation

Every plan that introduces an HTTP endpoint MUST include an **API Example** section per endpoint:

````markdown
### API: POST /api/v1/<resource>

**Request**

```json
{
  "field": "value"
}
```

**Response `201 Created`**

```json
{
  "id": "uuid",
  "field": "value"
}
```

**Error cases**
| Status | When |
|---|---|
| 400 | Validation fails |
| 404 | Related resource not found |
| 409 | Duplicate field |
````

Place this section after the Task Checklist and before Task 1.

---

## Remember

- Exact file paths from repo root always
- Prose is bullets, not paragraphs; describe behavior in words, not as code — never placeholder
  prose like "add validation here" either
- Do not invent or lock in names for new methods/functions the plan proposes — describe them by
  purpose (e.g. "a new shared uniqueness-check helper on `AuthService`"). Keep the literal names of
  methods/classes that already exist in the codebase.
- No code blocks or bash commands inside a task — Verification names existing/new tests by
  `describe`/`it` title, not commands; how to run them (`pnpm jest <pattern>`) stays
  implicit/standard, not prescribed per task
- This project's `tsconfig.json` has no `paths` alias configured — use relative imports, don't
  assume a `@/` alias exists
- Every entity uses `@Entity()`/`@PrimaryKey()`/`@Property()` per `.claude/rules/coding.md`
- Every API endpoint must have an example payload section (request + response + error cases)

---

## Plan Review Loop

After completing each chunk of the plan:

1. Dispatch plan-document-reviewer subagent (see `plan-document-reviewer-prompt.md`)
   - Provide: chunk content + path to spec
2. If ❌ Issues Found → fix → re-dispatch → repeat until ✅ Approved
3. If ✅ Approved → proceed to next chunk

**Chunk size:** ≤1000 lines, logically self-contained.
If loop exceeds 5 iterations, surface to user.

---

## Execution Handoff

After saving the plan:

**"Plan saved to `specs/YYYY-MM-DD/<feature-name>/plan.md`. Ready to implement — should I
proceed?"**

On confirmation, implement task-by-task in this session: write test → run → implement → run →
next task.
