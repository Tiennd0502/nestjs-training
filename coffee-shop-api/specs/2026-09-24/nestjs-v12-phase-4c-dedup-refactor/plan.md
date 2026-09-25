# NestJS v12 Upgrade — Phase 4c: Remove Duplication & Refactor — Task Doc

Parent spec: `specs/2026-09-24/nestjs-v12-upgrade/plan.md` (section 5, Phase 4).

## 1. Task Understanding

- Last of the three Phase 4 plans, after 4a (naming and dead code) and 4b (interfaces → classes).
- It removes duplicated logic:
  - soft delete, pagination meta, search condition, partial update, paginated response mapping;
  - the admin-route decorator stack.
- It also cleans up controllers and services: business logic and type-cast workarounds that sit
  in the wrong layer.
- **Deliberate API change — Task 7 (C1):**
  - `ProductService`, `ProductVariantService` and `ProductImageService` currently throw Nest
    built-ins (`NotFoundException`, `ConflictException`). Their error bodies therefore carry
    generic `errCode`s.
  - Category and user already throw `ItemNotFoundException` / `DuplicateResourceException` with
    feature-specific `ERROR_CODES` and `ERROR_DESCRIPTIONS`.
  - Unifying on the domain exceptions changes the product/variant/image 404 and 409 bodies.
  - This is intended. Phase 5 compares against the Phase 0 baseline with these deltas expected.
- Every other task is behavior-preserving.

## 2. Desired Outcome (Checklist)

- [ ] No duplicated pagination-meta, search-condition, soft-delete, partial-update or
      paginated-mapping logic remains in modules.
- [ ] Admin-route decorator stacks are expressed once.
- [ ] Product, variant and image errors use the domain exceptions with feature-specific
      `ERROR_CODES`/`ERROR_DESCRIPTIONS`.
- [ ] No business logic or type-cast workarounds remain in controllers or in
      `ProductService.update()`.
- [ ] Lint, build, unit and e2e pass. Only tests tied to Task 7's deliberate change have updated
      expectations, apart from assertions that move to the new shared operations.

## 3. Input (current state)

- Duplication:
  - Pagination `meta` (`limit`, `currentPage`, `pageCount`, `totalCount`) is built by hand in
    `mikro-orm-category.repository.ts`, `mikro-orm-user.repository.ts`, and twice in
    `mikro-orm-product.repository.ts`.
  - The name/slug `$ilike` search condition is repeated in the category and product adapters.
  - "Find, set `deletedAt`, save" is repeated in five services.
  - "Drop undefined fields, then `Object.assign`" is repeated in `UserService.update()`,
    `ProductService.update()` and `ProductVariantService.update()`.
  - `{ data: result.data.map(fromEntity), meta }` is repeated in the three list endpoints.
  - The admin-route decorator stack (`UseGuards(AuthGuard, RolesGuard)`, `Roles([ADMIN])`,
    `ApiBearerAuth`, plus 401/403 error docs) is repeated on every admin route.
- Refactor targets:
  - Product, variant and image services throw Nest built-in exceptions. `ERROR_CODES` and
    `ERROR_DESCRIPTIONS` have no `PRODUCT`, `PRODUCT_VARIANT` or `PRODUCT_IMAGE` entries.
  - `ProductController.create()` converts variant `weight`/`price`/`discountValue` from number to
    string.
  - `ProductService.update()` assigns `categoryId as unknown as Product['category']`.
  - `CategoryController` defines an `isActiveAdmin` helper, with a redundant
    `user.status as UserStatus` cast.
- Phase 4b is complete. It provides:
  - the shared abstract base port (`src/common/repositories/`);
  - the `PaginatedResult`/`QueryParams` classes;
  - the input classes.

## 4. Output (target state)

| Area | Target |
|---|---|
| Soft delete | One soft-delete operation on the shared base port |
| Shared helpers | Pagination-result builder, search-condition builder, defined-fields assignment and paginated-response mapping in `src/common/utils/` |
| Admin routes | One composed decorator in `src/common/decorators/` |
| Errors | `PRODUCT`, `PRODUCT_VARIANT`, `PRODUCT_IMAGE` entries in `ERROR_CODES` and `ERROR_DESCRIPTIONS`; domain exceptions in all services |
| Controllers/services | No field conversion in `ProductController`, no double cast in `ProductService`, no helper functions in `CategoryController` |

## Non-goals

- No change to routes, request validation rules, or success response bodies.
- No change to error bodies other than those listed under Task 7.
- No new features, and no changes to the entity schema. No migration is expected.

## Ordering

- Tasks 1–5 (shared logic) are independent of each other.
- Task 6 (admin decorator) is independent.
- Task 7 (C1) is independent, but it is the only task that changes API output. Land it as its own
  commit.
- Tasks 8–10 can run in any order.
- Run lint, build and the affected specs after every task. Run the full unit and e2e suites after
  Tasks 6, 7 and 10.

---

## Task Checklist

- [ ] Task 1: Centralize soft delete on the shared base port (A2)
- [ ] Task 2: Centralize paginated-result building in adapters (A1)
- [ ] Task 3: Centralize the name/slug search condition (A4)
- [ ] Task 4: Centralize "assign only defined fields" for partial updates (A3)
- [ ] Task 5: Centralize paginated response mapping in controllers (A5)
- [ ] Task 6: Compose the admin-route decorator stack (A6)
- [ ] Task 7: Unify product, variant and image errors on domain exceptions (C1)
- [ ] Task 8: Move variant number-to-string conversion out of the controller (C2)
- [ ] Task 9: Remove the category reference cast in `ProductService.update()` (C3)
- [ ] Task 10: Move `isActiveAdmin` out of `CategoryController` (C4)

---

### Task 1: Centralize soft delete on the shared base port (A2)

**Description:**
- Five services repeat "load the entity, set `deletedAt`, save".
- The marking and saving belong in one place.

**Input:**
- `remove()` in `CategoryService`, `ProductService`, `ProductVariantService`,
  `ProductImageService`, and `UserService` (renamed in Phase 4a, Task 3).
- The shared abstract base port from Phase 4b, Task 3.

**Output:**
- The shared base port offers a soft-delete operation for any `BaseEntity`, implemented once on
  top of `save`.
- Each service's `remove()` loads the entity through its existing `findOne()` and calls that
  operation. Services no longer set `deletedAt` themselves.

**Acceptance Criteria:**

- [ ] No service assigns `deletedAt` directly.
- [ ] Every delete still returns 204 and leaves the row with a non-null `deleted_at`.
- [ ] Deleting a missing or already-deleted id still returns 404.

**Verification:**

- `remove` cases in the category, product, product-variant and product-image service specs, and
  `remove` (ex-`softDelete`) in `UserService`. Assertions move from "save called with `deletedAt`
  set" to "soft-delete operation called with the loaded entity".
- `CategoryController (e2e)` → `DELETE /categories/:id responds 204 and soft-deletes the
  category`.
- `ProductController (e2e)` → `DELETE /products/:id responds 204 and soft-deletes the product`.

---

### Task 2: Centralize paginated-result building in adapters (A1)

**Description:**
- Three adapters build `{ data, meta: { limit, currentPage, pageCount, totalCount } }` by hand,
  four times in total.

**Input:**
- `findAll()` in `mikro-orm-category.repository.ts`, `mikro-orm-user.repository.ts`, and
  `mikro-orm-product.repository.ts` (both the DB-paginated branch and the in-memory price
  branch).

**Output:**
- One shared helper in `src/common/utils/` builds a `PaginatedResult` from rows, a total count
  and the query.
- All four call sites use it.

**Acceptance Criteria:**

- [ ] `Math.ceil(totalCount / limit)` appears only in the shared helper.
- [ ] `meta` values are identical for every existing list case, including an empty result and a
      partial last page.

**Verification:**

- `MikroOrmUserRepository` → `findAll` → `computes meta, rounding pageCount up when totalCount
  does not divide evenly by limit`.
- New unit spec for the helper:
  - an exact division;
  - a remainder;
  - zero rows.
- `ProductController (e2e)` → `GET /products filtering and sorting (e2e)`: all cases.

---

### Task 3: Centralize the name/slug search condition (A4)

**Description:**
- The category and product adapters build the same case-insensitive name-or-slug condition.

**Input:**
- `findAll()` in `mikro-orm-category.repository.ts` and `mikro-orm-product.repository.ts`.

**Output:**
- One shared helper, used by both adapters, builds the name/slug search condition for a search
  term.

**Acceptance Criteria:**

- [ ] The `$ilike` name/slug condition is defined once.
- [ ] Search results for categories and products are unchanged.

**Verification:**

- `ProductController (e2e)` → `combines categoryId and search`.
- `CategoryController (e2e)` → `GET /categories responds 200 with the paginated envelope, no
  session required`.
- New unit spec for the helper: the condition shape for a term, and no condition for an
  empty/absent term.

---

### Task 4: Centralize "assign only defined fields" for partial updates (A3)

**Description:**
- Three services strip `undefined` values from a patch before `Object.assign`.
- That way, omitted fields don't overwrite stored values. The logic is repeated each time.

**Input:**
- `update()` in `UserService`, `ProductService` and `ProductVariantService`.

**Output:**
- One shared helper in `src/common/utils/` applies only the defined fields of a patch to a
  target.
- The three services use it.

**Acceptance Criteria:**

- [ ] The `Object.entries(...).filter(value !== undefined)` pattern appears only in the helper.
- [ ] `null` in a patch still clears a nullable field, and `undefined` still leaves it untouched.

**Verification:**

- `UserService` → `update` → `updates and returns the user`.
- `ProductService` → `update`: all cases.
- `ProductVariantService` → `update`: all cases, including name recomputation.
- New unit spec for the helper: a defined value, `null`, and `undefined`.

---

### Task 5: Centralize paginated response mapping in controllers (A5)

**Description:**
- The category, product and user list endpoints each map `result.data` through their response
  DTO's `fromEntity()` and pass `meta` through.

**Input:**
- `findAll()` in `category.controller.ts`, `product.controller.ts` and `user.controller.ts`.
- The `PaginatedResult` class from Phase 4b, Task 2.

**Output:**
- One shared way, a helper in `src/common/utils/`, maps a `PaginatedResult` of entities to a
  `PaginatedResult` of response DTOs, given a mapper.
- The three controllers use it.

**Acceptance Criteria:**

- [ ] No controller builds `{ data: ..., meta: result.meta }` by hand.
- [ ] List response bodies are unchanged.

**Verification:**

- `UserController` → `findAll` → `delegates to UserService.findAll and maps data to
  ResponseUserDto, passing meta through`.
- The three paginated-envelope e2e cases listed in Phase 4b, Task 2.

---

### Task 6: Compose the admin-route decorator stack (A6)

**Description:**
- Every admin-only route repeats the same group of decorators: guards, roles, bearer auth, and
  401/403 error docs.
- Any drift between copies would be an authorization or docs bug.

**Input:**
- Admin routes:
  - `POST`, `PATCH /:id`, `DELETE /:id` in `category.controller.ts` and `product.controller.ts`;
  - `POST`, `GET`, `GET /:id`, `PATCH /:id`, `DELETE /:id` in `user.controller.ts`. That
    controller already applies `AuthGuard` and `ApiBearerAuth` at class level, and `GET /me`
    must stay open to any authenticated user.
- `src/common/decorators/roles.decorator.ts` and `api-response.decorator.ts`.

**Output:**
- One composed decorator in `src/common/decorators/` applies `AuthGuard` + `RolesGuard`, the
  ADMIN role, bearer auth, and the 401/403 `ApiErrorResponse` docs.
- Admin routes use it in place of the individual decorators. Route-specific error docs (400, 404,
  409) stay on each route.
- `UserController`'s class-level setup is adjusted, so `/me` keeps authentication without the
  admin role.

**Acceptance Criteria:**

- [ ] Every admin route still returns 401 without a session and 403 for a non-ADMIN user.
- [ ] `GET /api/v1/users/me` still returns 200 for a non-ADMIN user.
- [ ] Public `GET` routes on categories and products still need no session.
- [ ] Swagger still shows bearer auth and 401/403 responses on exactly the same routes as before.

**Verification:**

- `CategoryController (e2e)` → `mutating routes without a Clerk session`, `mutating routes with
  an authenticated non-ADMIN user`.
- `ProductController (e2e)` → the same two groups.
- `UserController auth (e2e)` → `authenticated ACTIVE non-ADMIN local user` →
  `GET /users responds 403` and `GET /me responds 200 with the caller own profile`.
- `src/common/guards/roles.guard.spec.ts`, `src/common/guards/auth.guard.spec.ts`.
- `/docs` is compared by hand with the Phase 3 output.

---

### Task 7: Unify product, variant and image errors on domain exceptions (C1)

**Description:**
- Category and user errors carry feature-specific `errCode`s and descriptions through the domain
  exceptions.
- Product, variant and image errors use Nest built-ins, so clients get generic `errCode`s and no
  description.
- This is the one **deliberate API change** in the phase.

**Input:**
- `ProductService` (`NotFoundException`, `ConflictException`).
- `ProductVariantService` (`NotFoundException`, `ConflictException` for SKU).
- `ProductImageService` (`NotFoundException`).
- `src/common/constants/error-code.constant.ts`: `ERROR_CODES` has no `PRODUCT`,
  `PRODUCT_VARIANT` or `PRODUCT_IMAGE` keys.
- `src/common/constants/message.constant.ts`: `ERROR_DESCRIPTIONS` has only `CATEGORY` and
  `USER`.

**Output:**
- `ERROR_CODES` and `ERROR_DESCRIPTIONS` gain `PRODUCT` (not found, name exists),
  `PRODUCT_VARIANT` (not found, SKU exists) and `PRODUCT_IMAGE` (not found) entries. Codes follow
  the existing camelCase style (e.g. `categoryNotFound`).
- The three services throw `ItemNotFoundException` / `DuplicateResourceException` with an error
  detail built from those constants, the same way `CategoryService` does.
- `ProductController`'s `ApiErrorResponse` docs still list the same statuses.

**Acceptance Criteria:**

- [ ] No product, variant or image service throws a Nest built-in HTTP exception.
- [ ] The product 404 body carries the product-specific `errCode`, `field` and description, with
      the same status.
- [ ] The duplicate product name 409 and duplicate SKU 409 bodies do the same.
- [ ] The changed bodies are recorded as the expected deltas for Phase 5's baseline comparison.

**Verification:**

- The `ProductService`, `ProductVariantService` and `ProductImageService` specs:
  - assertions move from the built-in exceptions to `ItemNotFoundException` /
    `DuplicateResourceException`;
  - they add checks on the error detail's `errCode`.
  This is the only place where test expectations change on purpose.
- `ProductController (e2e)` → `GET /products/:id responds 404 for a missing product`,
  `POST /products responds 409 for a duplicate name`, `POST /products responds 404 for a
  nonexistent category`. The first two assert the new `errCode`s.

---

### Task 8: Move variant number-to-string conversion out of the controller (C2)

**Description:**
- `ProductController.create()` converts variant `weight`, `price` and `discountValue` from
  numbers to decimal strings before calling the service.
- Decimal handling is domain normalization. It belongs with the variant logic, not in a
  controller.

**Input:**
- `ProductController.create()` in `src/modules/product/controllers/product.controller.ts`.
- `ProductService.create()` and `ProductVariantService.create()`.
- The variant input shapes from Phase 4b, Task 5.

**Output:**
- The controller passes the validated DTO through unchanged.
- The variant service layer accepts numeric `weight`/`price`/`discountValue` and converts them to
  decimal strings before touching the repository. It keeps `null`/`undefined` for
  `discountValue`.

**Acceptance Criteria:**

- [ ] `ProductController.create()` contains no field conversion.
- [ ] Stored decimals and the response `weight`/`price`/`discountValue` values are unchanged.

**Verification:**

- `ProductVariantService` → `create` → `creates and returns a variant on a unique SKU, deriving
  name from weight + unit`, updated to pass numbers and assert the stored strings.
- `ProductController (e2e)` → `POST /products responds 201, derives a slug, and creates the
  supplied images and variants`.

---

### Task 9: Remove the category reference cast in `ProductService.update()` (C3)

**Description:**
- `update()` assigns `categoryId as unknown as Product['category']`, which defeats type checking.
- It already loads the target category through `CategoryService.findOne()` to validate it, so it
  can assign that loaded entity instead.

**Input:**
- `ProductService.update()` in `src/modules/product/services/product.service.ts`.

**Output:**
- When `categoryId` changes, `update()` assigns the category returned by
  `CategoryService.findOne()`.
- No double cast remains.

**Acceptance Criteria:**

- [ ] No `as unknown as` remains in `src/`.
- [ ] Changing a product's category still persists the new category, and the response
      `categoryId` reflects it.
- [ ] An unknown `categoryId` still returns 404.

**Verification:**

- `ProductService` → `update` → `re-validates the category via CategoryService.findOne when
  categoryId changes`, extended to assert the loaded category is assigned.
- `ProductController (e2e)` → `PATCH /products/:id responds 200 and updates the product`.

---

### Task 10: Move `isActiveAdmin` out of `CategoryController` (C4)

**Description:**
- The controller defines a role/status check to decide whether soft-deleted categories are
  visible.
- That check is authorization logic, not request mapping. Its `user.status as UserStatus` cast is
  redundant, because `User.status` is already typed.

**Input:**
- The module-level `isActiveAdmin` helper in `src/modules/category/controllers/category.controller.ts`.
- Its use in `findAll()` and `findOne()`.

**Output:**
- The check lives in `src/common/` as a reusable, user-based check, next to the other auth
  helpers. The cast is removed.
- The controller calls it to build the `includeDeleted` option.

**Acceptance Criteria:**

- [ ] `CategoryController` defines no helper functions.
- [ ] Soft-deleted categories are visible to an active ADMIN and hidden from everyone else,
      including an INACTIVE ADMIN.

**Verification:**

- `CategoryController (e2e)` → `GET /categories includes soft-deleted rows for an ADMIN caller`.
- New unit spec for the moved check:
  - active ADMIN → true;
  - inactive ADMIN → false;
  - USER → false;
  - no user → false.
