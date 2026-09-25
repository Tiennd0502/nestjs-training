# NestJS v12 Upgrade — Phase 4a: Naming & Dead Code — Task Doc

Parent spec: `specs/2026-09-24/nestjs-v12-upgrade/plan.md` (section 5, Phase 4).

## 1. Task Understanding

- Phase 4 folds code-quality work into the upgrade. It is split into three plans, done in order:
  - **4a: naming and dead code** (this plan),
  - 4b: interfaces → classes,
  - 4c: remove duplication and refactor.
- This plan holds the low-risk, mechanical changes:
  - consistent file and method naming;
  - no inline error text;
  - no unused DTOs.
- It runs **after** NestJS 12 (Phase 3). The upgrade has already been proven against an untouched
  baseline, and the test suite that went green at the end of Phase 3 is the safety net.
- Every task is behavior-preserving. No route, request, response or error body changes.

## 2. Desired Outcome (Checklist)

- [ ] Constants follow the `.constant.ts` convention and are imported by path, with no barrel.
- [ ] Every feature enum lives in its module's `enums/` folder.
- [ ] Every service names its delete operation `remove()`.
- [ ] No service contains an inline error description.
- [ ] No unused update DTOs remain for images and variants.
- [ ] Lint, build, unit and e2e pass with no test expectation changes other than method renames.

## 3. Input (current state)

- `src/common/constants/env.ts` plus a barrel `src/common/constants/index.ts`. The other constant
  files use the `.constant.ts` suffix and are imported by path.
- `src/modules/webhook/clerk-webhook.enum.ts` sits at the module root, while `product` and
  `product-variant` keep enums in `enums/`.
- `UserService.softDelete()`, while every other service names this operation `remove()`.
- `CategoryService.update()` inlines a description string, while
  `ERROR_DESCRIPTIONS.CATEGORY.NAME_EXISTS` already holds the same text.
- `src/modules/product-image/dto/update-product-image.dto.ts` and
  `src/modules/product-variant/dto/update-product-variant.dto.ts` are imported nowhere.
- Phase 3 is complete: NestJS 12, MikroORM 7, TypeScript 6, all tests green.

## 4. Output (target state)

| Area | Target |
|---|---|
| Constants | `src/common/constants/env.constant.ts`, imported by path; `index.ts` removed |
| Webhook enum | `src/modules/webhook/enums/clerk-webhook.enum.ts` |
| User service | `UserService.remove()`; all callers updated |
| Category service | `update()` uses `ERROR_DESCRIPTIONS.CATEGORY.NAME_EXISTS` |
| Dead code | The two unused update DTOs deleted |

## Non-goals

- No change to routes, request validation, or response and error bodies.
- No interface or DI changes. Those are in Phase 4b.

## Ordering

- The tasks are independent and can land in any order.
- Run lint, build and the affected specs after every task, and the full unit and e2e suites at the
  end.

---

## Task Checklist

- [ ] Task 1: Rename the env constants file and drop the constants barrel (B2)
- [ ] Task 2: Move the webhook enum into `enums/` (B3)
- [ ] Task 3: Rename `UserService.softDelete()` to `remove()` (B1)
- [ ] Task 4: Replace the inline description in `CategoryService.update()` (B5)
- [ ] Task 5: Remove unused update DTOs for images and variants (C5)

---

### Task 1: Rename the env constants file and drop the constants barrel (B2)

**Description:**
- `src/common/constants/env.ts` is the only constants file without the `.constant.ts` suffix.
- It is also the only one exposed through a barrel, `index.ts`.
- Both break the project's constants convention (one file per topic, suffixed, imported by path).

**Input:**
- `src/common/constants/env.ts`, which holds `DEFAULT_PORT`, `DEFAULT_DB_PORT`,
  `DEFAULT_API_VERSION` and `API_PREFIX`.
- `src/common/constants/index.ts`, which re-exports it.
- Consumers importing through the barrel: `src/main.ts`, `test/utils/init-test-app.util.ts`,
  `test/utils/api-path.util.ts`.

**Output:**
- `src/common/constants/env.constant.ts`, with the same exports.
- `src/common/constants/index.ts` deleted.
- All consumers import `env.constant.ts` by path.

**Acceptance Criteria:**

- [ ] No file imports from the `common/constants` folder path itself.
- [ ] The exported names and values are unchanged.
- [ ] The app boots on the same port, prefix and default version.

**Verification:**

- The full e2e suite passes. Every e2e test builds URLs through `test/utils/api-path.util.ts` and
  boots through `test/utils/init-test-app.util.ts`.

---

### Task 2: Move the webhook enum into `enums/` (B3)

**Description:**
- Feature enums live in `<feature>/enums/` (`product/enums/`, `product-variant/enums/`).
- The webhook module's enum is the only one at a module root.

**Input:**
- `src/modules/webhook/clerk-webhook.enum.ts` (`ClerkWebhookEventType`).
- Its import in `src/modules/webhook/services/clerk-webhook.service.ts`.

**Output:**
- `src/modules/webhook/enums/clerk-webhook.enum.ts`, with the same enum.
- The old file removed and all imports updated.

**Acceptance Criteria:**

- [ ] No `*.enum.ts` file sits directly under a module root.
- [ ] The enum values are unchanged.

**Verification:**

- `ClerkWebhookService` → `handleEvent` → `user.created`, `user.updated`, `user.deleted` and
  `unhandled event type` cases pass unchanged.
- `WebhookController (e2e)` → `POST /webhooks/clerk` passes.

---

### Task 3: Rename `UserService.softDelete()` to `remove()` (B1)

**Description:**
- Every service names its delete operation `remove()`, except `UserService`.

**Input:**
- `UserService.softDelete()` in `src/modules/user/services/user.service.ts`.
- Callers:
  - `src/modules/user/controllers/user.controller.ts`;
  - `src/modules/webhook/services/clerk-webhook.service.ts`;
  - e2e cleanup in `test/e2e/user.e2e-spec.ts`, `category.e2e-spec.ts`, `product.e2e-spec.ts`
    and `webhook.e2e-spec.ts`;
  - `src/modules/user/services/user.service.spec.ts`,
    `src/modules/user/controllers/user.controller.spec.ts`,
    `src/modules/webhook/services/clerk-webhook.service.spec.ts`.

**Output:**
- `UserService.remove()`, with identical behavior.
- All callers and test mocks updated.
- Test titles that name the old method are renamed to match.

**Acceptance Criteria:**

- [ ] No `softDelete` method remains on any service. The `softDelete` MikroORM filter name is
      unaffected.
- [ ] `DELETE /api/v1/users/:id` still returns 204 and soft-deletes.

**Verification:**

- `UserService` → the `softDelete` describe block, renamed to `remove`:
  `sets deletedAt without removing the row`, `throws ItemNotFoundException for a missing or
  already-deleted id`.
- `UserController` → `remove` → `delegates to UserService.softDelete`, retitled to the new
  method.
- `ClerkWebhookService` → `user.deleted` → `soft-deletes the matching local user`.

---

### Task 4: Replace the inline description in `CategoryService.update()` (B5)

**Description:**
- The duplicate-name error in `update()` inlines its description.
- `ERROR_DESCRIPTIONS.CATEGORY.NAME_EXISTS` already holds that text, and `create()` uses it.
- Inline error text breaks the rule that error text lives only in `message.constant.ts`.

**Input:**
- `CategoryService.update()` in `src/modules/category/services/category.service.ts`.

**Output:**
- `update()` uses `ERROR_DESCRIPTIONS.CATEGORY.NAME_EXISTS`.

**Acceptance Criteria:**

- [ ] No string literal error description remains in any service.
- [ ] The 409 body for a duplicate name on update is unchanged.

**Verification:**

- `CategoryService` → `update` → `throws DuplicateResourceException when the new name collides
  with another category`.

---

### Task 5: Remove unused update DTOs for images and variants (C5)

**Description:**
- `UpdateProductImageDto` and `UpdateProductVariantDto` are imported nowhere.
- Dead DTOs mislead readers into thinking matching endpoints exist.

**Input:**
- `src/modules/product-image/dto/update-product-image.dto.ts`.
- `src/modules/product-variant/dto/update-product-variant.dto.ts`.

**Output:**
- Both files deleted.
- `findAllByProduct()` on both services stays. `test/e2e/product.e2e-spec.ts` uses it.

**Acceptance Criteria:**

- [ ] Neither file exists.
- [ ] Build passes.
- [ ] The Swagger document is unchanged, since neither DTO was referenced by a route.

**Verification:**

- Build, plus the full unit suite.
