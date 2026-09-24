# coffee-shop-api upgrade plan: NestJS 11 → 12

| | |
|---|---|
| Author | Tien Nguyen |
| Date | 2026-09-24 |
| Status | Awaiting review |
| References | [Release v12.0.0](https://github.com/nestjs/nest/releases/tag/v12.0.0) · [NestJS migration guide](https://docs.nestjs.com/migration-guide) · [MikroORM v6 → v7](https://mikro-orm.io/docs/upgrading-v6-to-v7) |

## 1. Summary

- **Goal:** move coffee-shop-api from NestJS 11 to NestJS 12 without changing API behavior, and fold in code-quality work: refactor code, update naming, remove duplicated code, replace interfaces with classes, and verify the user/category/product API responses. The only intended API change is more specific error codes for product, variant and image errors (Phase 4c, Task 7).
- **Analysis result:** most v12 breaking changes **do not affect** this project. Three things are required:
  1. **Node ≥ 24.15** in every environment. Already met today; we only need to pin it.
  2. **TypeScript 6**, plus upgrading the tooling that depends on it (Jest, ESLint).
  3. **Upgrade MikroORM 6 → 7.** This is the key finding, and the Nest release notes don't mention it: no 6.x release of `@mikro-orm/nestjs` supports Nest 12. Only 7.x does, and 7.x requires MikroORM core v7.
- **Approach:** 6 phases, each with its own checks. The refactor runs after the upgrade, so the upgrade is proven against untouched code first. MikroORM is upgraded **before** Nest 12, because `@mikro-orm/nestjs@7.1.0` works with both Nest 11 and 12. That keeps ORM failures separate from Nest failures. This round covers NestJS 12 and MikroORM 7 together, replaces `ts-node` with `tsx` (required by MikroORM 7), and keeps CommonJS + Jest.
- **Scope:** see [section 7](#7-scope).

## 2. Current state

| Component | Current version |
|---|---|
| NestJS (`@nestjs/common`, `core`, `platform-express`, `testing`) | 11.2.1 |
| MikroORM (`@mikro-orm/*`) | 6.6.16 (`@mikro-orm/nestjs` 6.1.2) |
| TypeScript | 5.9.3 |
| Node | 24.19 (local), `node:24-alpine` (Docker) |
| Module system | CommonJS |
| Tests | Jest 30 + ts-jest; e2e uses supertest against Postgres |

## 3. v12 breaking changes and their impact on this project

Each item in the release notes and migration guide was checked against the current code.

| # | v12 breaking change | Impact | Evidence |
|---|---|---|---|
| 1 | Core packages ship as ESM only; CommonJS apps still work through `require(esm)` | ⚠️ Yes | The project is CommonJS. The guide says *Jest can only load the v12 packages on Node ≥ 24.9*; older versions fail with `ERR_REQUIRE_ASYNC_MODULE`. |
| 2 | Node ≥ 20.19 to run apps; CLI/schematics need Node ≥ 24.15 | ⚠️ Pin version | Local and Docker are on Node 24, which is enough |
| 3 | TypeScript bumped to v6 | ⚠️ Yes | `ts-jest` and `typescript-eslint` need upgrading; `tsconfig.json` uses `baseUrl`, which TS 6 deprecates |
| 4 | `ValidationPipe` error format changed | ✅ Almost none | The project uses its own `exceptionFactory` ([validation-pipe.config.ts](../../../src/configs/validation-pipe.config.ts)) and returns errors through `GlobalExceptionFilter` |
| 5 | Lifecycle hooks run by level in the module tree | ✅ None | No `onModuleInit`, `onApplicationBootstrap` or shutdown hooks exist |
| 6 | Subclasses no longer inherit `@Optional()` | ✅ None | `@Optional()` is not used |
| 7 | `ConsoleLogger` enables structured params by default | ✅ None | Only strings, or a string plus a stack, are logged |
| 8 | `@nestjs/config` moves to Standard Schema (Joi needs v18+) | ✅ None | Uses its own `validate` function ([env.validation.ts](../../../src/configs/env.validation.ts)), not Joi |
| 9 | NATS v3, GraphQL (`graphiql`, `subscriptions-transport-ws` removed), Terminus, Webpack, `angular` schematic | ✅ None | Not used by the project |

## 4. Packages to upgrade

### Required

| Group | Package | Current → Target | Reason |
|---|---|---|---|
| NestJS | `@nestjs/common`, `core`, `platform-express`, `testing` | 11.2.1 → ^12.1.0 | Upgrade target |
| | `@nestjs/swagger` | 11.4.7 → ^12.0.2 | Peer requires `@nestjs/*` ^12 |
| | `@nestjs/config` | 4.0.4 → ^12.0.1 | Aligns with Nest 12 versioning |
| | `@nestjs/cli` / `@nestjs/schematics` | 11.x → ^12.0.6 / ^12.0.5 | Ship with TS 6 |
| | `@nestjs/throttler` | 6.5.0 → ^6.7.0 | 6.x already supports ^12; patch bump only |
| MikroORM | `@mikro-orm/nestjs` | 6.1.2 → ^7.1.0 | Only release with a `@nestjs/*` ^12 peer |
| | `@mikro-orm/core`, `postgresql`, `migrations`, `cli`, `seeder` | 6.6.16 → ^7.2.1 | `@mikro-orm/nestjs` 7 requires core ^7 |
| | `@mikro-orm/decorators` *(new)* | → ^7.2.1 | v7 moves decorators into a separate package |
| Tooling | `typescript` | 5.9.3 → **~6.0.3** | Nest 12 uses TS 6. **Do not** use `latest` (7.0.2); it is outside the range swagger, ts-jest and typescript-eslint accept. |
| | `ts-jest` / `jest` / `typescript-eslint` | → ^29.4.13 / ^30.5.2 / ^8.70.1 | TS 6 support |
| | `tsx` *(new, replaces `ts-node`)* | → latest | CLI tool that runs `.ts` files. The MikroORM 7 CLI no longer supports `ts-node`; see [section 7](#7-scope) |
| v12 features | `zod` *(new)* | → latest | Standard Schema library for the `StandardSchemaValidationPipe` pilot (Phase 3, Task 8). class-validator stays for every other DTO. |
| | `@nestjs/observe` *(new)* | → latest v12-compatible | Official observability SDK, active outside production only (Phase 3, Task 9) |

### Unchanged
- `class-validator`, `class-transformer`, `reflect-metadata`, `rxjs`: already on the latest release and satisfy Nest 12's peers.
- `@clerk/express` (supports Express 5), `helmet`, `svix`, `supertest`, `eslint`, `prettier`, `husky` and the rest: don't depend on Nest.

## 5. Phases

Each phase is a separate commit (Phase 4 is split into three plans, 4a–4c). Don't move to the next phase until the current one meets its criteria. Each phase has a detailed task doc:

- [Phase 0: Prep & environment](../nestjs-v12-phase-0-prep-environment/plan.md)
- [Phase 1: TypeScript 6](../nestjs-v12-phase-1-typescript-6/plan.md)
- [Phase 2: MikroORM 7](../nestjs-v12-phase-2-mikro-orm-7/plan.md)
- [Phase 3: NestJS 12](../nestjs-v12-phase-3-nestjs-12/plan.md)
- Phase 4: Refactor & cleanup, in three plans done in order:
  - [Phase 4a: Naming & dead code](../nestjs-v12-phase-4a-naming-dead-code/plan.md)
  - [Phase 4b: Interfaces → classes](../nestjs-v12-phase-4b-interfaces-to-classes/plan.md)
  - [Phase 4c: Remove duplication & refactor](../nestjs-v12-phase-4c-dedup-refactor/plan.md)
- [Phase 5: Full verification & docs](../nestjs-v12-phase-5-verification-docs/plan.md)

| Phase | Work | Done when |
|---|---|---|
| **0. Prep & environment** | Create branch `feat/upgrade-nestjs-v12`. Run the full test suite for a baseline, and capture the full user, category and product response bodies (success and error) for comparison. Pin Node ≥ 24.15 via `engines` in `package.json` and `.nvmrc`; check Docker and CI. | Lint, build, unit and e2e all pass on the current code; `node -v` ≥ 24.15 locally, in Docker and in CI |
| **1. TypeScript 6** *(still Nest 11, MikroORM 6)* | Upgrade TS and tooling. Replace `ts-node` with `tsx` in `pretest:e2e` and `test:debug`, then remove `ts-node`. This is done early to prepare the MikroORM CLI for Phase 2. Handle `baseUrl` if TS 6 reports it. | Lint, build, unit, e2e and `migration:up` pass |
| **2. MikroORM 7** *(still Nest 11)* | Upgrade the 6 `@mikro-orm/*` packages and apply the code changes in [Appendix A](#appendix-a-code-changes-for-mikroorm-7) | Same as above, and `migration:create` produces **no** schema changes |
| **3. NestJS 12** | Upgrade all `@nestjs/*` packages together (their peers depend on each other). Run `nest upgrade --dry-run` first and accept only the version bumps. Then adopt five v12 features, each as its own commit:<br>• graceful shutdown (`enableShutdownHooks`)<br>• `errorCode` in `GlobalExceptionFilter`<br>• route conflict diagnostics<br>• `StandardSchemaValidationPipe` piloted on `POST /categories` (adds `zod`)<br>• `@nestjs/observe` outside production | `pnpm install` shows no peer warnings; lint, build and unit tests pass; existing responses unchanged, including the pilot route's 400 body |
| **4a. Naming & dead code** | 5 tasks: constants file and barrel, webhook enum folder, `UserService.remove()`, inline error text, unused update DTOs | Lint, build, unit and e2e pass; no behavior change |
| **4b. Interfaces → classes** | 5 tasks: shared shapes become classes (`src/common/interfaces/` removed); repository ports and `AuthProvider` become abstract classes (no `Symbol` tokens); input types become classes with one naming convention | Lint, build, unit and e2e pass; no behavior change |
| **4c. Remove duplication & refactor** | 10 tasks: shared soft delete, pagination, search, partial update, paginated mapping, admin-route decorator; product/variant/image errors on domain exceptions; controller and service cleanups | Lint, build, unit and e2e pass; only the product/variant/image error tests change expectations |
| **5. Full verification & docs** | Rerun all tests; compare user, category and product responses with the Phase 0 baseline; smoke-test the app; build Docker; update `README` and `CLAUDE.md` | All tests pass, responses match the baseline apart from the documented Phase 4c error deltas, `/docs` and Docker work |

Manual checks in Phase 5:
- Swagger `/docs`.
- 1 route requiring Clerk, 1 route requiring the ADMIN role.
- Rate limiting returns 429.
- Clerk webhook (rawBody).
- Migration CLI: nothing pending, no schema diff.
- `docker:dev` and `docker:prod`.

## 6. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| MikroORM 7 infers column types differently (`ReflectMetadataProvider` is no longer the default) | Medium | Set `ReflectMetadataProvider` explicitly in the config; `migration:create` must produce no diff |
| Default loading strategy changes to `balanced`, altering product populate or pagination results | Medium | Run product e2e: list, filter, sort, pagination |
| Existing migrations aren't recognized because MikroORM 7 drops `umzug` | Low | Run `migration:up` on a database that already has data; old migrations must not rerun |
| Jest fails with `ERR_REQUIRE_ASYNC_MODULE` | Low | Node ≥ 24.15 in every environment |
| TypeScript 7 gets installed by accident | Low | Pin `~6.0.3` |
| `nest upgrade` switches the project to ESM, Vitest or oxlint | Low | Run `--dry-run` first and accept only the version bumps |

**Rollback:** each phase is one commit including `pnpm-lock.yaml`, so phases can be reverted individually. Nothing affects `feat/coffee-shop-api` until merge.

## 7. Scope

- Upgrade to MikroORM 7 in this round. No 6.x release of `@mikro-orm/nestjs` supports Nest 12, so there is no other way to get valid peer dependencies.
- Use **`tsx`** instead of `ts-node`. `tsx` is a CLI tool that runs `.ts` files directly with Node, in the same category as `ts-node`; it has nothing to do with React or JSX.
  - The reason comes from **MikroORM 7, not NestJS 12**: the MikroORM 7 CLI only detects the oxc, swc, tsx, jiti, tsimp and nub loaders, not `ts-node`. Without the switch, `migration:*` would have to be built first and run from `dist/`.
  - `tsx` replaces `ts-node` in all 3 places: the MikroORM CLI, `pretest:e2e` and `test:debug`. `ts-node` is then removed.
  - No effect on build, runtime or production: those use `nest build` (tsc), and Jest uses `ts-jest`.
- **Keep CommonJS + Jest**; don't move to ESM, Vitest or oxlint yet.
  - `@nestjs/*` v12 packages ship as ESM only, but CommonJS apps can still load them through Node's `require(esm)`. Jest works on Node ≥ 24.9, and this plan pins Node ≥ 24.15.
  - The migration guide states that moving to ESM, Vitest or oxlint is optional.
  - Moving to ESM would touch almost every file: adding `.js` extensions to imports, changing `jest.*` to `vi.*`, replacing `__dirname`. If we do it, it will be a separate plan and MR once Nest 12 is stable.
- **Include code-quality work** (Phase 4):
  - Refactor code, update naming, remove duplicated code, replace interfaces with classes.
  - It runs after the upgrade, so the upgrade is verified against untouched code.
  - Repository ports and `AuthProvider` become abstract classes. An abstract class exists at runtime, so it serves as its own DI token, and the `Symbol` tokens and `@Inject()` go away. The port/adapter split stays the same.
  - Product, variant and image errors move to the domain exceptions used by category and user. Their 404/409 bodies gain feature-specific `errCode`s and descriptions. This is the one intended API change.
- **Verify the user, category and product API responses** (captured in Phase 0, compared in Phase 5).

## 8. Out of scope

- Web deploy testing. Handled separately.

v12 features not adopted in this round (the adopted ones are in Phase 3, Tasks 5–9):
- Moving to ESM and Vitest.

Major upgrades of packages unrelated to Nest: `eslint` 10, `dotenv` 18, `svix` 2, `uuid` 14.

---

## Appendix A: Code changes for MikroORM 7

Checked against the current source.

| MikroORM 7 change | Required change in this project |
|---|---|
| Decorators move to `@mikro-orm/decorators/legacy` | Update imports in 6 files: `common/entities/base.entity.ts` and the entity files of `category`, `product`, `product-image`, `product-variant`, `user`. The `Opt` type and the `Collection` class are still imported from `@mikro-orm/core`. |
| `ReflectMetadataProvider` is no longer the default | Add `metadataProvider` to [mikro-orm.config.ts](../../../src/configs/mikro-orm.config.ts). Many `@Property()` decorators don't declare `type` and rely on `emitDecoratorMetadata`. Import path to be confirmed during implementation. |
| `orm.getSchemaGenerator()` removed; `clearDatabase()` renamed to `clear()` | [test/reset-test-db.ts](../../../test/reset-test-db.ts): change to `orm.schema.clear()` |
| CLI doesn't support `ts-node`; the `tsNode` option becomes `preferTs` | Use `tsx` from Phase 1. Check that `configPaths` in `package.json` is still read. |
| Stricter types for `em.create()`/`em.assign()` | Fix any type errors the build reports |
| `persistAndFlush` removed, QueryBuilder no longer directly awaitable, string entity references deprecated, automatic `.env` loading removed | ✅ No change needed: the project already uses `persist().flush()`, doesn't use QueryBuilder, already uses `() => Entity`, and the config already has `import 'dotenv/config'` |

## Appendix B: Planned commands

```bash
# Phase 1
pnpm add -D typescript@~6.0.3 ts-jest@^29.4.13 jest@^30.5.2 typescript-eslint@^8.70.1 tsx

# Phase 2
pnpm add @mikro-orm/core@^7.2.1 @mikro-orm/postgresql@^7.2.1 @mikro-orm/migrations@^7.2.1 \
         @mikro-orm/nestjs@^7.1.0 @mikro-orm/decorators@^7.2.1
pnpm add -D @mikro-orm/cli@^7.2.1 @mikro-orm/seeder@^7.2.1

# Phase 3
pnpm add -D @nestjs/cli@^12.0.6
pnpm nest upgrade --dry-run
pnpm add @nestjs/common@^12.1.0 @nestjs/core@^12.1.0 @nestjs/platform-express@^12.1.0 \
         @nestjs/swagger@^12.0.2 @nestjs/config@^12.0.1 @nestjs/throttler@^6.7.0
pnpm add -D @nestjs/testing@^12.1.0 @nestjs/schematics@^12.0.5

# Checks after each phase
pnpm run lint && pnpm run build && pnpm run test && pnpm run test:e2e
```
