# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This is a NestJS starter (`@nestjs/cli` scaffold) — `src/` currently contains only the default `AppModule`/`AppController`/`AppService` ("Hello World" route), unmodified from `nest new`. Package manager is **pnpm** (see `pnpm-lock.yaml`, `pnpm-workspace.yaml`).

The tech stack for upcoming features is decided (not yet installed — `package.json` has no ORM/validation/auth packages yet): **MikroORM + PostgreSQL** for persistence, **class-validator**/**class-transformer** for DTO validation, NestJS **built-in `HttpException`** subclasses for error handling, and **Auth (register/login/JWT)** as the first feature. See `.claude/rules/coding.md` for the full rules and `.claude/templates/` for concrete code shape.

`specs/2026-08-17/nestjs-book-summary/plan.md` is a Vietnamese-language study guide summarizing *"Nest.js: A Progressive Node.js Framework"* (2018), annotated with "⚠️ Lỗi thời" (outdated) callouts where the book's APIs no longer match modern NestJS (v11, used here). Treat this file as learning reference material, not a spec for this codebase — when it conflicts with current `@nestjs/*` APIs (e.g. `Repository.findOneBy()` vs. the book's `findOneById()`, `@nestjs/passport` vs. manual Passport wiring, decorator-based Mongoose schemas vs. plain-object schemas), prefer the modern API.

## Commands

```bash
pnpm install              # install deps

pnpm run start            # run app
pnpm run start:dev        # watch mode
pnpm run start:prod       # run compiled dist/main.js

pnpm run build            # nest build -> dist/

pnpm run lint             # eslint --fix on src/apps/libs/test
pnpm run format            # prettier --write on src/ and test/

pnpm run test              # unit tests (jest, rootDir: src, *.spec.ts)
pnpm run test:watch
pnpm run test:cov
pnpm run test:e2e          # e2e tests (jest --config test/jest-e2e.json, *.e2e-spec.ts)
pnpm run test:debug        # jest --runInBand with --inspect-brk
```

Run a single unit test file: `pnpm jest src/app.controller.spec.ts` (or `pnpm jest <pattern>` — jest resolves from `rootDir: src`, testRegex `.*\.spec\.ts$`).
Run a single e2e test file: `pnpm jest --config test/jest-e2e.json test/app.e2e-spec.ts`.

## Architecture notes

- Unit tests (`*.spec.ts`) live alongside source in `src/`; e2e tests (`*.e2e-spec.ts`) live in `test/` and boot the full `AppModule` via `Test.createTestingModule` + `app.init()`, hitting it with `supertest`.
- `tsconfig.json` targets `nodenext` module/moduleResolution with `emitDecoratorMetadata`/`experimentalDecorators` on (required for Nest DI) and `strictNullChecks` on but `noImplicitAny` off.
- ESLint (`eslint.config.mjs`) uses `typescript-eslint`'s `recommendedTypeChecked` + `eslint-plugin-prettier`; `no-explicit-any` is off, `no-floating-promises` and `no-unsafe-argument` are downgraded to warnings.

## NestJS agent skills

`.claude/skills/` (symlinked from `.agents/skills/`, installed via `npx skills add amirtaherkhani/nestjs-agent-skills`, tracked in `skills-lock.json`) provides seven skills for working in this repo. Load the relevant one's `SKILL.md` before acting when the task matches:

| Skill | Use for |
|---|---|
| `nestjs-professional-software-engineering` | Default for feature work, bug fixes, refactors — version-correct syntax, verified against installed `@nestjs/*` |
| `nestjs-architecture-principles` | Module boundaries, DI, service/data boundaries |
| `nestjs-oop-design-patterns` | SOLID-based refactors without over-engineering |
| `nestjs-features-performance` | API design, security, caching, queues, scalability |
| `nestjs-code-audit` | Read-only static/semantic scan of the repo (no mutation) |
| `nestjs-feature-audit` | Compare a branch's changes against a documented roadmap |
| `nestjs-git-commit-pr-message` | Staging, commit/PR wording, push safety |

Each skill's own `SKILL.md` defines a conflict guard for when more than one applies (e.g. implementation vs. architecture vs. audit) — resolve ownership per that guard before editing. Given this project's current state (stock scaffold, no real features yet), `nestjs-professional-software-engineering` and `nestjs-architecture-principles` are the ones most likely to apply first.

## Coding rules

`.claude/rules/coding.md` is the binding contract for how features get built (layer discipline, MikroORM persistence, class-validator DTOs, NestJS built-in error handling, Auth conventions) — written ahead of the first feature so implementation follows it, not the other way around. `.claude/templates/` holds the matching concrete code shape (`entity.ts`, `dto.ts`, `service.ts`, `controller.ts`, `module.ts`, `jwt.strategy.ts`) for the Auth feature; these are illustrative references only — the packages they import (`@mikro-orm/*`, `class-validator`, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`) are not yet installed, and `.claude/` is outside TypeScript's default compile scope so they don't affect `pnpm run build`/`lint`.

## Execution discipline

Follow `.claude/execution/auto-flow.md` for every non-trivial change: Plan (Plan Mode, saved to `specs/YYYY-MM-DD/<feature>/plan.md` for anything beyond a localized fix) → Confirm → Execute task-by-task with TDD → Test (`pnpm run test`/`test:e2e`/`lint`) → Review.

Apply `.claude/rules/karpathy-guidelines.md` throughout: state assumptions, keep changes surgical, avoid speculative abstractions, define verifiable success criteria before looping.
