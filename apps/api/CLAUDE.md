# CLAUDE.md — api

NestJS 12 / TypeScript 6 / ESM backend, package `api`; monorepo guidance is in the root `CLAUDE.md`. `README.md` holds the ERD, the endpoint table with auth levels, every env var and the Docker/e2e setup: read it before asking about behaviour.

## Commands (from here, or `pnpm api <script>` from the root)

```bash
pnpm run start:dev          # watch mode
pnpm run build
pnpm run lint               # eslint --fix
pnpm run test               # unit: src/**/*.spec.ts
pnpm run test:cov
pnpm run test:e2e           # e2e: test/**/*.e2e-spec.ts, needs a reachable Postgres
pnpm run migration:create   # migration from entity changes
pnpm run migration:up
pnpm run docker:dev         # app + Postgres with hot reload

pnpm vitest run src/modules/category/services/category.service.spec.ts   # one unit file
pnpm vitest run -t '<test name>'                                          # one test by name
pnpm vitest run --config ./vitest.config.e2e.ts test/e2e/category.e2e-spec.ts   # one e2e file
```

## Gotchas

- `@repo/constants` and `@repo/schemas`: tests read their `src`, but the running API imports their `dist`, which root `pnpm dev`/`pnpm dev:api` and `docker:dev` rebuild with `tsc --watch` (`start:dev` alone does not). `nest --watch` restarts only when a package's `.d.ts` changes (a value), not when only its `.js` does (a message's text): restart `dev:api`/`docker:dev` after that kind of edit.
- `pretest:e2e` truncates every table (except migrations) in the database named by `.env.test`, so `.env.test` must point at a different database from `start:dev`'s. `test/setup-env.ts` loads `.env.test` before any app module is imported, which is why `src/` has no notion of a test environment.
- A request with no matching `User` row is not an error: `UserResolutionMiddleware` leaves `req.user` unset. `POST /webhooks/clerk` skips both auth middlewares (`app.module.ts`) and is authenticated by its Svix signature instead.
- When planning or reviewing, read `.claude/rules/coding.md` and `testing.md` even if no matching file is open.
