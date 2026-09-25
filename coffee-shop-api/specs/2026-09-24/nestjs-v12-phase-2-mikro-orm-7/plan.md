# NestJS v12 Upgrade — Phase 2: MikroORM 7 — Task Doc

Parent spec: `specs/2026-09-24/nestjs-v12-upgrade/plan.md` (section 5, Phase 2 and Appendix A).
Reference: [MikroORM v6 → v7 upgrading guide](https://mikro-orm.io/docs/upgrading-v6-to-v7).

## 1. Task Understanding

- Nest 12 forces this phase:
  - no 6.x release of `@mikro-orm/nestjs` supports `@nestjs/*` ^12;
  - `@mikro-orm/nestjs@7.1.0` does (`^11.0.5 || ^12.0.0`), but requires `@mikro-orm/core` ^7.
- It runs **before** the Nest upgrade, while the app is still on NestJS 11. That's possible
  because `@mikro-orm/nestjs@7.1.0` also accepts Nest 11, and it keeps ORM failures separate from
  framework failures.
- MikroORM 7 changes that affect this codebase (checked against `src/`):
  - Decorators move to the separate package `@mikro-orm/decorators`; legacy decorators are
    imported from its `legacy` entry point.
  - `ReflectMetadataProvider` is no longer the default. Many `@Property()` declarations omit
    `type` and rely on `emitDecoratorMetadata`, so it must be configured explicitly.
  - `orm.getSchemaGenerator()` is removed, and `clearDatabase()` is renamed to `clear()`.
  - The CLI drops `ts-node` support and the `tsNode` option, replaced by `preferTs` and automatic
    loader detection.
  - `em.create()`/`em.assign()` have stricter types.
  - The default loading strategy becomes `balanced`.
  - `forceUtcTimezone` is on by default.
- MikroORM 7 changes that need no code change here:
  - `persistAndFlush` removal: adapters already use `persist().flush()`.
  - QueryBuilder no longer awaitable, knex → kysely: no QueryBuilder or knex usage.
  - String entity references deprecated: relations already use `() => Entity`.
  - Automatic `.env` loading removed: `src/configs/mikro-orm.config.ts` already imports
    `dotenv/config`.
  - `forceUtcTimezone`: all timestamp columns are `timestamptz`.
- Open item from the parent spec: the exact import path of `ReflectMetadataProvider` in v7 isn't
  stated in the upgrade guide. It is resolved in Task 2 against the installed package's type
  definitions.

## 2. Desired Outcome (Checklist)

- [ ] All `@mikro-orm/*` packages are on v7, and `@mikro-orm/nestjs` is on 7.1.x.
- [ ] Entities load with the same metadata as before. The schema diff against the current
      database is empty.
- [ ] Test DB reset, migrations CLI and seeder CLI work through `tsx`.
- [ ] Every repository adapter compiles against MikroORM 7 types, and every query returns the same
      results as the baseline.
- [ ] Lint, build, unit and e2e pass on NestJS 11 + MikroORM 7.

## 3. Input (current state)

- `coffee-shop-api/package.json`:
  - dependencies `@mikro-orm/core`, `@mikro-orm/postgresql`, `@mikro-orm/migrations` at ^6.6.16,
    and `@mikro-orm/nestjs` at ^6.1.2;
  - devDependencies `@mikro-orm/cli`, `@mikro-orm/seeder` at ^6.6.16;
  - a top-level `mikro-orm.configPaths` listing `./src/configs/mikro-orm.config.ts` and
    `./dist/configs/mikro-orm.config.js`.
- `coffee-shop-api/src/configs/mikro-orm.config.ts`:
  - `defineConfig` from `@mikro-orm/postgresql`;
  - glob-based `entities`/`entitiesTs`;
  - `migrations`/`seeder` paths;
  - no `metadataProvider`.
- Entity files that import decorators from `@mikro-orm/core`:
  - `coffee-shop-api/src/common/entities/base.entity.ts` (`Entity`, `Filter`, `PrimaryKey`,
    `Property`, plus the `Opt` type);
  - `coffee-shop-api/src/modules/category/entities/category.entity.ts`;
  - `coffee-shop-api/src/modules/product/entities/product.entity.ts` (also `Collection`);
  - `coffee-shop-api/src/modules/product-image/entities/product-image.entity.ts`;
  - `coffee-shop-api/src/modules/product-variant/entities/product-variant.entity.ts`;
  - `coffee-shop-api/src/modules/user/entities/user.entity.ts`.
- `coffee-shop-api/test/reset-test-db.ts` calls `orm.getSchemaGenerator().clearDatabase()`.
- Repository adapters are the only MikroORM consumers besides entities and config:
  `coffee-shop-api/src/modules/*/repositories/mikro-orm-*.repository.ts`.
  - They use `find`/`findOne`/`count`-style calls with `filters: { softDelete }` (category) and
    `populate: ['images', 'variants']` (product).
- Three migrations in `coffee-shop-api/src/migrations/` extend `Migration` from
  `@mikro-orm/migrations`.
- `src/seeders/` does not exist yet.
- Phase 1 is complete: TS 6, and `tsx` is available.

## 4. Output (target state)

- `coffee-shop-api/package.json` and `pnpm-lock.yaml`:
  - `@mikro-orm/core`, `postgresql`, `migrations`, `cli`, `seeder` at ^7.2.1;
  - `@mikro-orm/nestjs` at ^7.1.0;
  - `@mikro-orm/decorators` added.
- `coffee-shop-api/src/configs/mikro-orm.config.ts` sets the reflect-metadata provider explicitly.
- The six entity files import decorators from `@mikro-orm/decorators` (legacy entry). Types and
  runtime classes (`Opt`, `Collection`) keep importing from `@mikro-orm/core`.
- `coffee-shop-api/test/reset-test-db.ts` uses the v7 schema API.
- The MikroORM CLI configuration in `coffee-shop-api/package.json` resolves the TS config through
  `tsx`.
- Repository adapters compile against v7 types. Behavior is unchanged.

## Non-goals

- No NestJS version change. That's Phase 3.
- No move to `defineEntity` or ES-spec decorators; stay on legacy decorators.
- No new migrations. Any schema diff is treated as a metadata bug to fix, not a migration to
  generate.
- No adoption of new MikroORM 7 features.

## Ordering

- Task 1 first.
- Tasks 2 and 3 together make entities load. Neither works alone, so they land in the same
  commit.
- Task 4 needs Tasks 1–3.
- Task 5 needs Task 1.
- Task 6 is last, because it needs everything compiling.

---

## Task Checklist

- [ ] Task 1: Upgrade the MikroORM packages
- [ ] Task 2: Configure the reflect-metadata provider explicitly
- [ ] Task 3: Move entity decorators to `@mikro-orm/decorators`
- [ ] Task 4: Update the test database reset script
- [ ] Task 5: Run the MikroORM CLI through `tsx`
- [ ] Task 6: Align repository adapters with MikroORM 7 types and defaults

---

### Task 1: Upgrade the MikroORM packages

**Description:**
- `@mikro-orm/nestjs` 7 is the only release line with a NestJS 12 peer.
- It requires the whole MikroORM family on v7, plus the new decorators package.

**Input:**
- `coffee-shop-api/package.json`:
  - `@mikro-orm/core`, `postgresql`, `migrations` (dependencies) and `cli`, `seeder`
    (devDependencies) at ^6.6.16;
  - `@mikro-orm/nestjs` at ^6.1.2.

**Output:**
- Those six packages on v7: `@mikro-orm/nestjs` ^7.1.0, and the rest ^7.2.1.
- `@mikro-orm/decorators` ^7.2.1 added to dependencies.
- `pnpm-lock.yaml` updated.
- If Phase 1 deferred removing `ts-node`, it's removed here, once Task 5 lands.

**Acceptance Criteria:**

- [ ] Every `@mikro-orm/*` package in `package.json` is on a v7 range.
- [ ] All `@mikro-orm/*` packages resolve to the same minor version, except `@mikro-orm/nestjs`,
      which is versioned separately.
- [ ] `pnpm install` reports no peer warnings for `@mikro-orm/*`, including
      `@mikro-orm/nestjs` → `@nestjs/*` ^11.0.5.

**Verification:**

- Covered by Tasks 2–6. This task alone doesn't compile, because of the moved decorators.

---

### Task 2: Configure the reflect-metadata provider explicitly

**Description:**
- MikroORM 7 no longer defaults to `ReflectMetadataProvider`.
- Entities rely on it: many `@Property()` declarations have no `type` and get their column type
  from `emitDecoratorMetadata`.
- Without it, discovery fails or infers different column types.

**Input:**
- `coffee-shop-api/src/configs/mikro-orm.config.ts`, which has no `metadataProvider` option.
- `reflect-metadata` ^0.2.2 is already a dependency.

**Output:**
- `coffee-shop-api/src/configs/mikro-orm.config.ts` sets `metadataProvider` to MikroORM 7's
  reflect-metadata provider.
- The import path is taken from the installed v7 packages' type definitions.
- The same config object is still used by `MikroOrmModule.forRoot` in `src/app.module.ts`, by the
  CLI and by `test/reset-test-db.ts`.

**Acceptance Criteria:**

- [ ] The config sets the reflect-metadata provider explicitly.
- [ ] The app boots and discovers all six entities: `BaseEntity` (abstract), `Category`,
      `Product`, `ProductImage`, `ProductVariant`, `User`.
- [ ] Every entity property keeps the column type it had under v6, confirmed by the empty schema
      diff in Task 5.

**Verification:**

- The e2e suites boot the full `AppModule`. All of them pass:
  - `CategoryController (e2e)`,
  - `ProductController (e2e)`,
  - `UserController auth (e2e)`,
  - `WebhookController (e2e)`,
  - `GlobalExceptionFilter (e2e)`.

---

### Task 3: Move entity decorators to `@mikro-orm/decorators`

**Description:**
- MikroORM 7 removes the decorators from `@mikro-orm/core`.
- They now live in `@mikro-orm/decorators`, and the legacy (`experimentalDecorators`) flavor is
  the one this project uses.

**Input:**
- These files import decorators from `@mikro-orm/core`:
  - `coffee-shop-api/src/common/entities/base.entity.ts`: `Entity`, `Filter`, `PrimaryKey`,
    `Property`.
  - `coffee-shop-api/src/modules/category/entities/category.entity.ts`.
  - `coffee-shop-api/src/modules/product/entities/product.entity.ts`: including `ManyToOne`,
    `OneToMany`, `Enum`.
  - `coffee-shop-api/src/modules/product-image/entities/product-image.entity.ts`.
  - `coffee-shop-api/src/modules/product-variant/entities/product-variant.entity.ts`.
  - `coffee-shop-api/src/modules/user/entities/user.entity.ts`: including `Enum`, `Unique`.

**Output:**
- All six files import every decorator (`Entity`, `Property`, `PrimaryKey`, `ManyToOne`,
  `OneToMany`, `Enum`, `Unique`, `Filter`) from the legacy entry point of
  `@mikro-orm/decorators`.
- Non-decorator symbols (`Opt`, `Collection`) keep importing from `@mikro-orm/core`.
- Decorator arguments are unchanged: `fieldName`, `items`, `nullable`, `onCreate`/`onUpdate`,
  the `softDelete` filter definition.

**Acceptance Criteria:**

- [ ] No file under `src/` imports a decorator from `@mikro-orm/core`.
- [ ] The `softDelete` filter on `BaseEntity` is still registered, and is on by default.
- [ ] Build passes.

**Verification:**

- `CategoryController (e2e)` → `DELETE /categories/:id responds 204 and soft-deletes the
  category` and `GET /categories includes soft-deleted rows for an ADMIN caller` pass. These prove
  the filter still applies and can be disabled.
- `ProductController (e2e)` → `DELETE /products/:id responds 204 and soft-deletes the product`
  passes.
- Service unit specs pass unchanged. They mock repository ports and never import entities'
  decorators at runtime:
  - `src/modules/category/services/category.service.spec.ts`,
  - `src/modules/product/services/product.service.spec.ts`,
  - `src/modules/product-image/services/product-image.service.spec.ts`,
  - `src/modules/product-variant/services/product-variant.service.spec.ts`.

---

### Task 4: Update the test database reset script

**Description:**
- MikroORM 7 removes `orm.getSchemaGenerator()` in favor of the `orm.schema` getter.
- It also renames `clearDatabase()` to `clear()`.
- `pretest:e2e` depends on this script, so every e2e run would fail without the change.

**Input:**
- `coffee-shop-api/test/reset-test-db.ts`, which:
  - loads `.env.test` via `./setup-env`;
  - initializes MikroORM with the shared config;
  - clears the database through the removed schema-generator API.

**Output:**
- `coffee-shop-api/test/reset-test-db.ts` clears the database through the v7 schema API.
- The load order is unchanged: the env setup import stays first.

**Acceptance Criteria:**

- [ ] `pretest:e2e` completes without error on an existing test database.
- [ ] After it runs, every table is empty, and the migration history table is intact.

**Verification:**

- Running the full e2e suite twice in a row gives identical results on both runs. This proves the
  reset leaves a clean state.

---

### Task 5: Run the MikroORM CLI through `tsx`

**Description:**
- The v7 CLI no longer uses `ts-node`, and the `tsNode` option is replaced by `preferTs`.
- The migration and seeder scripts must load `src/configs/mikro-orm.config.ts` and
  `src/migrations/*.ts` through `tsx`. Otherwise new migrations may be written to the wrong
  folder, or the CLI may silently fall back to the compiled config in `dist/`.

**Input:**
- `coffee-shop-api/package.json`:
  - scripts `migration:create`, `migration:up`, `migration:down`, `seeder:create`, `seeder:run`;
  - the `mikro-orm.configPaths` section.
- `coffee-shop-api/src/configs/mikro-orm.config.ts`: `migrations.path`/`pathTs` and
  `seeder.path`/`pathTs`.
- Three existing migrations in `coffee-shop-api/src/migrations/`.

**Output:**
- The MikroORM CLI loads the TS config via `tsx`. This uses the v7 mechanism for preferring
  TypeScript sources: the `preferTs` setting or its environment variable.
- The CLI config location is declared in a way v7 still reads. If `configPaths` in `package.json`
  is no longer honored, the v7 replacement is used instead.
- The migration scripts target `src/migrations/`.

**Acceptance Criteria:**

- [ ] `migration:up` on a database already at the latest migration reports nothing to run.
- [ ] None of the three existing migrations is re-executed.
- [ ] `migration:create` reports no schema difference and writes no new file. This proves entity
      metadata matches the v6 schema.
- [ ] When a diff does exist, e.g. from a temporary throwaway entity change, `migration:create`
      writes a `.ts` file into `src/migrations/`, not `dist/`. The throwaway change and file are
      discarded afterwards.
- [ ] The migration scripts don't require a prior build.

**Verification:**

- The CLI checks above, run against the dev database and the test database.
- The full e2e suite still passes after `migration:up` on a fresh test database.

---

### Task 6: Align repository adapters with MikroORM 7 types and defaults

**Description:**
- MikroORM 7 has stricter types for `em.create()`/`em.assign()` data.
- Its default loading strategy is now `balanced`, which changes the SQL generated for `populate`.
- The adapters must compile, and must return the same results, in the same order and page, as
  before.

**Input:**
- The adapters:
  - `coffee-shop-api/src/modules/category/repositories/mikro-orm-category.repository.ts`
    (`filters: { softDelete }` toggling);
  - `coffee-shop-api/src/modules/product/repositories/mikro-orm-product.repository.ts`
    (`populate: ['images', 'variants']`, name/price ordering, price range and search filters,
    pagination);
  - `coffee-shop-api/src/modules/product-image/repositories/mikro-orm-product-image.repository.ts`;
  - `coffee-shop-api/src/modules/product-variant/repositories/mikro-orm-product-variant.repository.ts`;
  - `coffee-shop-api/src/modules/user/repositories/mikro-orm-user.repository.ts`.
- Their repository port interfaces, which stay unchanged.

**Output:**
- All adapters compile against MikroORM 7 with no type suppressions added.
- Any type fix stays inside the adapter. Ports and services are untouched.
- If `balanced` loading changes product list results, the product adapter sets the loading
  strategy it needs explicitly. A global default is not changed.

**Acceptance Criteria:**

- [ ] Build passes, with no `@ts-ignore`, `@ts-expect-error` or `as any` added to adapters.
- [ ] Repository port interfaces and services are unchanged.
- [ ] Product list results match the baseline for every filter/sort combination: item set, order,
      `meta` totals, and populated `images`/`variants`.
- [ ] Soft-deleted rows are excluded by default, and included only where the adapter disables the
      filter.

**Verification:**

- `ProductController (e2e)` → `GET /products filtering and sorting (e2e)`: every case passes.
  These include:
  - `filters by categoryId`,
  - `filters by minPrice/maxPrice, matching a product if any non-deleted variant is in range`,
  - `sortBy PRICE_ASC orders by each product minimum variant price, with variant-less products
    last`,
  - `combining minPrice/maxPrice with sortBy PRICE_ASC still sorts by each product global minimum
    variant price`.
- `ProductController (e2e)` → `public GET routes` → `GET /products/:id responds 200 for an
  existing product, no session required` passes. It checks the populated images/variants.
- `CategoryController (e2e)` → `public GET routes`, `mutating routes with an authenticated ADMIN
  user`: all cases pass.
- `UserController auth (e2e)` and `WebhookController (e2e)` → `creates the local user from a
  validly signed user.created event`: all cases pass. These cover the user adapter's create path.
