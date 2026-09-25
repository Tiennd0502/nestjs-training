# NestJS v12 Upgrade — Phase 4b: Interfaces → Classes — Task Doc

Parent spec: `specs/2026-09-24/nestjs-v12-upgrade/plan.md` (section 5, Phase 4).

## 1. Task Understanding

- Second of the three Phase 4 plans, after 4a (naming and dead code) and before 4c (remove
  duplication and refactor).
- It replaces interfaces with classes in three places:
  - **Shared shapes:** `ErrorDetail`, `ErrorResponseBody` and `Meta` are each defined twice, as an
    interface and as the Swagger DTO class that implements it. Only the class stays.
    `QueryParams` and `PaginatedResult` also become classes, and `src/common/interfaces/` is
    removed.
  - **DI ports (architecture change):** the five repository ports and `AuthProvider` move from
    "interface + `Symbol` token + `@Inject(TOKEN)`" to abstract classes.
    - A TypeScript interface is erased at runtime, which is why it needs a separate token.
    - An abstract class exists at runtime, so it serves as its own DI token. The `Symbol` tokens
      and the `@Inject()` decorators go away.
    - The port/adapter split is unchanged: services still depend only on the port, and only
      adapters import MikroORM.
  - **Input types:** repository and service input shapes become classes under one naming
    convention.
- Every task is behavior-preserving. No route, request, response or error body changes.
- Phase 4c builds on this plan: the shared base port from Task 3, the `PaginatedResult` class from
  Task 2, and the input classes from Task 5.

## 2. Desired Outcome (Checklist)

- [ ] `src/common/interfaces/` no longer exists. Shared shapes are classes.
- [ ] Every repository port and `AuthProvider` is an abstract class injected without a `Symbol`
      token.
- [ ] A shared abstract base port exists for the operations every repository port shares.
- [ ] Repository and service input shapes are classes, named `Create<Domain>Data`,
      `Update<Domain>Data`, `<Domain>FindOptions` or `<Domain>Filters`.
- [ ] Lint, build, unit and e2e pass. The only test changes are where mocks are provided (the port
      class instead of a token).

## 3. Input (current state)

- `src/common/interfaces/error-response.interface.ts` (`ErrorDetail`, `ErrorResponseBody`)
  duplicates `src/common/dto/error-detail.dto.ts` and `error-response.dto.ts`, which
  `implements` them.
- `src/common/interfaces/pagination.interface.ts` (`Meta`, `QueryParams`, `PaginatedResult<T>`)
  duplicates `src/common/dto/meta.dto.ts` for `Meta`. `QueryParams` and `PaginatedResult` are used
  across controllers, services, adapters and `transform-response.interceptor.ts`.
- Five repository ports (`src/modules/*/repositories/*-repository.interface.ts`) and
  `src/common/providers/auth-provider.interface.ts` are interfaces with `Symbol` tokens.
- Input types mix kinds and suffixes: `CreateProductData` (interface), `CreateUserData` (type
  alias), `CreateProductVariantInput` (type alias), `UpdateProductVariantData` (interface), and a
  generically named `FindOptions` in the category port.
- Phase 4a is complete.

## 4. Output (target state)

| Area | Target |
|---|---|
| Shared shapes | Classes in `src/common/dto/`; `src/common/interfaces/` removed |
| Repository ports | Abstract classes in `src/modules/<feature>/repositories/<domain>.repository.ts`, plus a shared abstract base port in `src/common/repositories/` |
| Auth provider port | Abstract class in `src/common/providers/auth.provider.ts` |
| Input types | Classes named `Create<Domain>Data` / `Update<Domain>Data`, `<Domain>FindOptions`, `<Domain>Filters` |

## Non-goals

- No change to routes, request validation, or response and error bodies.
- No new shared helpers. Removing duplication is Phase 4c.
- No change to what any port operation does or returns.

## Ordering

- Tasks 1 and 2 (shared shapes) come first, because the ports in Task 3 reference
  `PaginatedResult`/`QueryParams`.
- Task 3 (repository ports) comes before Task 5, because the input types live in the port files.
- Task 4 (`AuthProvider`) is independent of Tasks 3 and 5.
- Run lint, build and the affected specs after every task. Run the full unit and e2e suites after
  Tasks 4 and 5.

---

## Task Checklist

- [ ] Task 1: Replace error-response interfaces with the existing DTO classes (D1)
- [ ] Task 2: Replace pagination interfaces with classes (D1, D2)
- [ ] Task 3: Convert repository ports to abstract classes (D3)
- [ ] Task 4: Convert `AuthProvider` to an abstract class (D3)
- [ ] Task 5: Convert input types to classes with consistent naming (D4, B4)

---

### Task 1: Replace error-response interfaces with the existing DTO classes (D1)

**Description:**
- `ErrorDetail` and `ErrorResponseBody` are each defined twice: once as interfaces, and once as
  the Swagger DTO classes that implement them.
- Keeping only the classes removes the duplicate definitions.

**Input:**
- `src/common/interfaces/error-response.interface.ts`.
- `src/common/dto/error-detail.dto.ts` and `src/common/dto/error-response.dto.ts`, which
  implement those interfaces.
- Consumers of the interfaces:
  - `src/common/exceptions/base.exception.ts`;
  - `src/common/filters/global-exception.filter.ts`;
  - `src/common/utils/validation-error.util.ts`;
  - their specs.

**Output:**
- `ErrorDetailDto` and `ErrorResponseDto` are the single definitions, and all consumers use them.
- `src/common/interfaces/error-response.interface.ts` deleted.

**Acceptance Criteria:**

- [ ] No `ErrorDetail`/`ErrorResponseBody` interface remains.
- [ ] Every error body is byte-for-byte unchanged.
- [ ] Swagger error schemas are unchanged.

**Verification:**

- `GlobalExceptionFilter`: all four cases in `src/common/filters/global-exception.filter.spec.ts`.
- `DomainException`, `ValidationException`, `InvalidRequestException`, `ItemNotFoundException`,
  `DuplicateResourceException` in `src/common/exceptions/base.exception.spec.ts`.
- `src/common/utils/validation-error.util.spec.ts`.
- `GlobalExceptionFilter (e2e)`.

---

### Task 2: Replace pagination interfaces with classes (D1, D2)

**Description:**
- `Meta` duplicates `MetaDto`.
- `QueryParams` and `PaginatedResult<T>` are interfaces shared across every layer.
- Making them classes finishes removing `src/common/interfaces/`.

**Input:**
- `src/common/interfaces/pagination.interface.ts` (`Meta`, `QueryParams`, `PaginatedResult<T>`).
- `src/common/dto/meta.dto.ts`, which implements `Meta`.
- Consumers:
  - the category, product and user controllers;
  - the category, product and user services;
  - the category, product and user ports and adapters;
  - `src/common/interceptors/transform-response.interceptor.ts` (`isPaginatedResult` type guard).

**Output:**
- `MetaDto` is the single meta definition.
- `QueryParams` and a generic `PaginatedResult` become classes in `src/common/dto/`.
- `src/common/interfaces/` removed.

**Acceptance Criteria:**

- [ ] The `src/common/interfaces/` folder no longer exists.
- [ ] List responses keep the exact `{ data, meta }` shape and values.
- [ ] `TransformResponseInterceptor` still recognizes paginated results. List bodies are not
      double-wrapped.

**Verification:**

- `src/common/interceptors/transform-response.interceptor.spec.ts`.
- `MikroOrmUserRepository` → `findAll`: all three cases.
- `CategoryController (e2e)` → `GET /categories responds 200 with the paginated envelope, no
  session required`.
- `ProductController (e2e)` → `GET /products responds 200 with the paginated envelope, no session
  required`.
- `UserController auth (e2e)` → `GET /users responds 200 with the paginated envelope`.

---

### Task 3: Convert repository ports to abstract classes (D3)

**Description:**
- TypeScript interfaces are erased at runtime, so each port needs a separate `Symbol` token and
  `@Inject(TOKEN)`.
- An abstract class exists at runtime, so it can be its own DI token. That removes the token and
  the decorator, and keeps the port/adapter split intact.

**Input:**
- Ports:
  - `src/modules/category/repositories/category-repository.interface.ts`
    (`CATEGORY_REPOSITORY`);
  - `src/modules/product/repositories/product-repository.interface.ts`;
  - `src/modules/product-image/repositories/product-image-repository.interface.ts`;
  - `src/modules/product-variant/repositories/product-variant-repository.interface.ts`;
  - `src/modules/user/repositories/user-repository.interface.ts`.
- Their bindings in each `<feature>.module.ts`.
- The `@Inject(<TOKEN>)` constructor parameters in each service.
- Token-based mocks in the service specs.

**Output:**
- Each port is an abstract class in `src/modules/<feature>/repositories/<domain>.repository.ts`,
  declaring the same operations. The `*-repository.interface.ts` files are removed.
- A shared abstract base port in `src/common/repositories/` declares the operations every port
  shares (`save`). Feature ports extend it. The base port imports no MikroORM.
- Each `MikroOrm<Domain>Repository` adapter extends or implements its port. It stays the only
  place importing MikroORM for the feature.
- Module bindings use the port class as the provider token. Services inject the port by type,
  without `@Inject`. No `Symbol` token remains.
- Service specs provide mocks under the port class.

**Acceptance Criteria:**

- [ ] No `*_REPOSITORY` `Symbol` token and no `@Inject(` for a repository remains in `src/` or
      `test/`.
- [ ] Services import only port classes, never MikroORM types.
- [ ] Every port's operation list is unchanged.
- [ ] DI resolves at boot for every module.

**Verification:**

- All service specs pass with mocks provided under the port class: `CategoryService`,
  `ProductService`, `ProductImageService`, `ProductVariantService`, `UserService`.
- The full e2e suite passes. It boots the real DI graph.

---

### Task 4: Convert `AuthProvider` to an abstract class (D3)

**Description:**
- `AuthProvider` follows the same interface + `Symbol` pattern as the repository ports.
- Converting it keeps one DI convention across the codebase.

**Input:**
- `src/common/providers/auth-provider.interface.ts`: `AuthProvider`, `AUTH_PROVIDER`, and the
  `AuthWebhookEvent` shape.
- `src/common/providers/auth-provider.module.ts` (binding).
- `src/common/providers/clerk-auth.provider.ts` (implementation).
- Consumers: `src/common/middlewares/user-resolution.middleware.ts`,
  `src/modules/webhook/services/clerk-webhook.service.ts`.
- Their specs.

**Output:**
- `AuthProvider` is an abstract class in `src/common/providers/auth.provider.ts`, with the same
  three operations. `AuthWebhookEvent` becomes a class alongside it.
- `ClerkAuthProvider` extends or implements it.
- `AuthProviderModule` binds and exports the class token. Consumers inject by type.
- `auth-provider.interface.ts` and `AUTH_PROVIDER` removed.

**Acceptance Criteria:**

- [ ] No `AUTH_PROVIDER` token remains.
- [ ] Webhook verification, role sync and session resolution behave as before.

**Verification:**

- `ClerkAuthProvider`: all `verifyWebhook`, `syncUserRole` and `getSessionUserId` cases.
- `UserResolutionMiddleware` → `use`: all four cases.
- `ClerkWebhookService` → `verifyAndParse` and all `handleEvent` cases.
- `WebhookController (e2e)` and `UserController auth (e2e)`: all cases.

---

### Task 5: Convert input types to classes with consistent naming (D4, B4)

**Description:**
- Repository and service input shapes use mixed kinds (interface vs. type alias) and mixed
  suffixes (`Data` vs. `Input`).
- The category port uses a generic `FindOptions`.
- One kind and one naming rule make the layers predictable.

**Input:**
- `CreateCategoryData`, `FindOptions` (category port).
- `CreateProductData`, `ProductFilters` (product port).
- `CreateProductWithCatalogData`, `UpdateProductData` (declared in
  `src/modules/product/services/product.service.ts`).
- `CreateProductImageData` (image port).
- `CreateProductVariantData` (variant port).
- `CreateProductVariantInput`, `UpdateProductVariantData` (declared in
  `src/modules/product-variant/services/product-variant.service.ts`).
- `CreateUserData` (user port, a `Pick` type alias).

**Output:**
- Every shape above is a class.
- Names follow `Create<Domain>Data` / `Update<Domain>Data` for writes, `<Domain>FindOptions` for
  read options, and `<Domain>Filters` for list filters:
  - `FindOptions` becomes `CategoryFindOptions`;
  - `CreateProductVariantInput` is renamed to fit the `Data` convention, distinguished from the
    port's shape by purpose, not by an `Input` suffix.
- Shapes consumed by a port live in that port's file.
- Service-level shapes (product create-with-catalog, product update, variant update) live in the
  owning service's file or its port. They don't live in a controller.

**Acceptance Criteria:**

- [ ] No `interface` or object `type` alias remains for these shapes.
- [ ] No `Input`-suffixed shape remains.
- [ ] Field names, optionality and nullability of every shape are unchanged.
- [ ] Build passes with no `as` casts added to satisfy the new classes.

**Verification:**

- All service specs and the full e2e suite pass unchanged.
