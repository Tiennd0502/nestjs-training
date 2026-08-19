# Auto Flow — Main Execution Contract

This is the primary flow control document. All AI code generation in this repo must follow this contract.

## Execution Order

```
User Request
  → PLAN (Plan Mode)
  → CONFIRM (wait for explicit go-ahead)
  → EXECUTE (task by task, TDD)
  → TEST (pnpm)
  → REVIEW (self-check + optional audit skill)
  → DONE
```

## Phase 1 — Plan

Before writing any code:

1. Read and understand the full request; inspect the relevant `src/` code and existing tests first.
2. Identify which module(s)/layer(s) are touched. Load `nestjs-architecture-principles` for boundary questions, `nestjs-oop-design-patterns` for refactors.
3. State assumptions explicitly — ask if ambiguous, per `.claude/rules/karpathy-guidelines.md` §1.
4. For anything beyond a trivial, localized change, use Plan Mode together with the `writing-plans` skill: Plan Mode governs *where*/*when* (it writes into this repo's `specs/` per `plansDirectory: "specs"` in `.claude/settings.json`, instead of the global `~/.claude/plans/`), `writing-plans` governs *what the document looks like* (header structure, Task Checklist, Acceptance Criteria, the Plan Review Loop). Plan Mode's filename is an auto-generated slug (e.g. `specs/misty-floating-falcon.md`), not the dated `specs/YYYY-MM-DD/<feature>/plan.md` shape `writing-plans` requires. **This is a required step, not optional**: as soon as Plan Mode writes the plan, before Confirm, move/copy it into `specs/YYYY-MM-DD/<feature-name>/plan.md` (today's date, a short kebab-case slug for `<feature-name>` describing the change) and remove the flat auto-named file — match the existing convention in `specs/2026-08-17/nestjs-book-summary/plan.md`.
5. **Wait for user confirmation** before implementing.

## Phase 2 — Execute

After confirmation:

1. Implement one task at a time. Default to `nestjs-professional-software-engineering` for implementation; hand off to a more specific skill (architecture, OOP, features/performance) per its own conflict guard when applicable.
2. TDD per task: write/extend the failing test → run it → implement → run again until it passes.
3. Touch only files required by the task — no drive-by refactors (`.claude/rules/karpathy-guidelines.md` §3).
4. No abstractions or features beyond what the task needs (§2).

## Phase 3 — Test

Run the checks that match what changed:

- Unit: `pnpm jest <pattern>` (fast, targeted) then `pnpm run test` (full unit suite)
- E2E, if HTTP/module wiring changed: `pnpm run test:e2e`
- `pnpm run lint` and `pnpm run build` before calling anything done

## Phase 4 — Review

1. Re-read the diff against `.claude/rules/karpathy-guidelines.md` — surgical, no speculative code, no hallucinated APIs.
2. For a broader pass across the touched area, optionally run the `nestjs-code-audit` skill (read-only).
3. Surface any violations or open questions before declaring done.

## Hard Rules

Coding/architecture rules live in `CLAUDE.md`'s Architecture section, the installed skills under `.claude/skills/`, and `.claude/rules/*.md`. This file does not restate them — it only enforces the order in which they get applied.
