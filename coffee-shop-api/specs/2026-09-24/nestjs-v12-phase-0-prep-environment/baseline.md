# Phase 0 Baseline

Recorded before any upgrade change, so later phases can be compared against it.

| | |
|---|---|
| Branch | `feat/upgrade-nestjs-v12` |
| Base commit | `147f822f` (`feat/coffee-shop-api`) |
| Node / pnpm | 24.19.0 / 10.28.2 |
| Database | PostgreSQL 18 (Docker), test database `coffee_shop_test`, 3 migrations applied |

## 1. Test results

| Check | Command | Result |
|---|---|---|
| Lint | `pnpm exec eslint "{src,apps,libs,test}/**/*.ts"` (run without `--fix`, so the baseline does not change any file) | **Pass**: 0 errors, 1 warning |
| Build | `pnpm run build` | **Pass** |
| Unit | `pnpm run test` | **Pass**: 20 suites, 143 tests |
| E2E | `pnpm run test:e2e` | **Pass**: 5 suites, 56 tests |

- The one lint warning: `src/main.ts:32`, `@typescript-eslint/no-floating-promises` (`bootstrap()` is not awaited).
- Tests that already fail: none.

## 2. Dataset

The responses in section 4 come from a fixed synthetic dataset, created by `test/baseline/capture-responses.capture.ts` on an empty test database. It contains no real data.

- Users (`*@baseline.test`): `admin` (ADMIN), `member` (USER), `target` (USER).
- Categories: `Baseline Espresso`, `Baseline Filter`.
- Products:
  - `Baseline Ethiopia Yirgacheffe`: category Espresso, LIGHT, ACTIVE, 2 images, 2 variants (one with a 10% discount).
  - `Baseline Colombia Supremo`: category Espresso, MEDIUM, ACTIVE, 1 variant.
  - `Baseline Sumatra Mandheling`: category Filter, DARK, ACTIVE, 1 variant (cheapest).
  - `Baseline Kenya AA`: category Filter, LIGHT, DRAFT, no variants.
- Generated ids are replaced with labels such as `<category:espresso>`, and timestamps with `<timestamp>`. Ids without a fixed label are numbered `<uuid-N>` by first appearance.
- Two runs on a freshly reset database produced identical files.

## 3. How to capture again

```bash
pnpm run pretest:e2e        # resets the test database
CAPTURE_OUT=<file.json> pnpm jest --config ./test/jest-e2e.json --runInBand \
  --testRegex 'capture-responses\.capture\.ts$'
diff baseline-responses.json <file.json>
```

`baseline-responses.json` (this folder) holds the same data as section 4, in a form that can be diffed.

## 4. Responses

### 1. category: list

- Request: `GET /api/v1/categories`
- Caller: public (no session)
- Status: **200**

```json
{
  "data": [
    {
      "id": "<category:espresso>",
      "name": "Baseline Espresso",
      "slug": "baseline-espresso",
      "createdAt": "<timestamp>"
    },
    {
      "id": "<category:filter>",
      "name": "Baseline Filter",
      "slug": "baseline-filter",
      "createdAt": "<timestamp>"
    }
  ],
  "meta": {
    "limit": 10,
    "currentPage": 1,
    "pageCount": 1,
    "totalCount": 2
  }
}
```

### 2. category: get by id

- Request: `GET /api/v1/categories/<category:espresso>`
- Caller: public (no session)
- Status: **200**

```json
{
  "data": {
    "id": "<category:espresso>",
    "name": "Baseline Espresso",
    "slug": "baseline-espresso",
    "createdAt": "<timestamp>"
  }
}
```

### 3. product: list

- Request: `GET /api/v1/products`
- Caller: public (no session)
- Status: **200**

```json
{
  "data": [
    {
      "id": "<product:ethiopia>",
      "categoryId": "<category:espresso>",
      "name": "Baseline Ethiopia Yirgacheffe",
      "slug": "baseline-ethiopia-yirgacheffe",
      "description": null,
      "roastLevel": "LIGHT",
      "isOrganic": true,
      "isFairTrade": false,
      "status": "ACTIVE",
      "tastingNotes": "Jasmine, bergamot, lemon",
      "origin": "Ethiopia",
      "processingMethod": "Washed",
      "createdAt": "<timestamp>",
      "images": [
        {
          "id": "<uuid-1>",
          "url": "https://example.com/baseline/ethiopia-1.jpg",
          "isPrimary": true,
          "sortOrder": 0
        },
        {
          "id": "<uuid-2>",
          "url": "https://example.com/baseline/ethiopia-2.jpg",
          "isPrimary": false,
          "sortOrder": 1
        }
      ],
      "variants": [
        {
          "id": "<uuid-3>",
          "sku": "BASELINE-ETH-250G",
          "weight": 250,
          "unit": "G",
          "name": "250.000G",
          "price": 12.5,
          "discountType": null,
          "discountValue": null,
          "quantity": 40
        },
        {
          "id": "<uuid-4>",
          "sku": "BASELINE-ETH-1KG",
          "weight": 1,
          "unit": "KG",
          "name": "1.000KG",
          "price": 40,
          "discountType": "PERCENT",
          "discountValue": 10,
          "quantity": 12
        }
      ]
    },
    {
      "id": "<product:colombia>",
      "categoryId": "<category:espresso>",
      "name": "Baseline Colombia Supremo",
      "slug": "baseline-colombia-supremo",
      "description": null,
      "roastLevel": "MEDIUM",
      "isOrganic": false,
      "isFairTrade": false,
      "status": "ACTIVE",
      "tastingNotes": null,
      "origin": null,
      "processingMethod": null,
      "createdAt": "<timestamp>",
      "images": [],
      "variants": [
        {
          "id": "<uuid-5>",
          "sku": "BASELINE-COL-500G",
          "weight": 500,
          "unit": "G",
          "name": "500.000G",
          "price": 20,
          "discountType": null,
          "discountValue": null,
          "quantity": 25
        }
      ]
    },
    {
      "id": "<product:sumatra>",
      "categoryId": "<category:filter>",
      "name": "Baseline Sumatra Mandheling",
      "slug": "baseline-sumatra-mandheling",
      "description": null,
      "roastLevel": "DARK",
      "isOrganic": false,
      "isFairTrade": false,
      "status": "ACTIVE",
      "tastingNotes": null,
      "origin": null,
      "processingMethod": null,
      "createdAt": "<timestamp>",
      "images": [],
      "variants": [
        {
          "id": "<uuid-6>",
          "sku": "BASELINE-SUM-250G",
          "weight": 250,
          "unit": "G",
          "name": "250.000G",
          "price": 8,
          "discountType": null,
          "discountValue": null,
          "quantity": 60
        }
      ]
    },
    {
      "id": "<product:kenya>",
      "categoryId": "<category:filter>",
      "name": "Baseline Kenya AA",
      "slug": "baseline-kenya-aa",
      "description": null,
      "roastLevel": "LIGHT",
      "isOrganic": false,
      "isFairTrade": false,
      "status": "DRAFT",
      "tastingNotes": null,
      "origin": null,
      "processingMethod": null,
      "createdAt": "<timestamp>",
      "images": [],
      "variants": []
    }
  ],
  "meta": {
    "limit": 10,
    "currentPage": 1,
    "pageCount": 1,
    "totalCount": 4
  }
}
```

### 4. product: list filtered by category

- Request: `GET /api/v1/products?categoryId=<category:espresso>`
- Caller: public (no session)
- Status: **200**

```json
{
  "data": [
    {
      "id": "<product:ethiopia>",
      "categoryId": "<category:espresso>",
      "name": "Baseline Ethiopia Yirgacheffe",
      "slug": "baseline-ethiopia-yirgacheffe",
      "description": null,
      "roastLevel": "LIGHT",
      "isOrganic": true,
      "isFairTrade": false,
      "status": "ACTIVE",
      "tastingNotes": "Jasmine, bergamot, lemon",
      "origin": "Ethiopia",
      "processingMethod": "Washed",
      "createdAt": "<timestamp>",
      "images": [
        {
          "id": "<uuid-1>",
          "url": "https://example.com/baseline/ethiopia-1.jpg",
          "isPrimary": true,
          "sortOrder": 0
        },
        {
          "id": "<uuid-2>",
          "url": "https://example.com/baseline/ethiopia-2.jpg",
          "isPrimary": false,
          "sortOrder": 1
        }
      ],
      "variants": [
        {
          "id": "<uuid-3>",
          "sku": "BASELINE-ETH-250G",
          "weight": 250,
          "unit": "G",
          "name": "250.000G",
          "price": 12.5,
          "discountType": null,
          "discountValue": null,
          "quantity": 40
        },
        {
          "id": "<uuid-4>",
          "sku": "BASELINE-ETH-1KG",
          "weight": 1,
          "unit": "KG",
          "name": "1.000KG",
          "price": 40,
          "discountType": "PERCENT",
          "discountValue": 10,
          "quantity": 12
        }
      ]
    },
    {
      "id": "<product:colombia>",
      "categoryId": "<category:espresso>",
      "name": "Baseline Colombia Supremo",
      "slug": "baseline-colombia-supremo",
      "description": null,
      "roastLevel": "MEDIUM",
      "isOrganic": false,
      "isFairTrade": false,
      "status": "ACTIVE",
      "tastingNotes": null,
      "origin": null,
      "processingMethod": null,
      "createdAt": "<timestamp>",
      "images": [],
      "variants": [
        {
          "id": "<uuid-5>",
          "sku": "BASELINE-COL-500G",
          "weight": 500,
          "unit": "G",
          "name": "500.000G",
          "price": 20,
          "discountType": null,
          "discountValue": null,
          "quantity": 25
        }
      ]
    }
  ],
  "meta": {
    "limit": 10,
    "currentPage": 1,
    "pageCount": 1,
    "totalCount": 2
  }
}
```

### 5. product: list sorted by price

- Request: `GET /api/v1/products?sortBy=PRICE_ASC`
- Caller: public (no session)
- Status: **200**

```json
{
  "data": [
    {
      "id": "<product:sumatra>",
      "categoryId": "<category:filter>",
      "name": "Baseline Sumatra Mandheling",
      "slug": "baseline-sumatra-mandheling",
      "description": null,
      "roastLevel": "DARK",
      "isOrganic": false,
      "isFairTrade": false,
      "status": "ACTIVE",
      "tastingNotes": null,
      "origin": null,
      "processingMethod": null,
      "createdAt": "<timestamp>",
      "images": [],
      "variants": [
        {
          "id": "<uuid-6>",
          "sku": "BASELINE-SUM-250G",
          "weight": 250,
          "unit": "G",
          "name": "250.000G",
          "price": 8,
          "discountType": null,
          "discountValue": null,
          "quantity": 60
        }
      ]
    },
    {
      "id": "<product:ethiopia>",
      "categoryId": "<category:espresso>",
      "name": "Baseline Ethiopia Yirgacheffe",
      "slug": "baseline-ethiopia-yirgacheffe",
      "description": null,
      "roastLevel": "LIGHT",
      "isOrganic": true,
      "isFairTrade": false,
      "status": "ACTIVE",
      "tastingNotes": "Jasmine, bergamot, lemon",
      "origin": "Ethiopia",
      "processingMethod": "Washed",
      "createdAt": "<timestamp>",
      "images": [
        {
          "id": "<uuid-1>",
          "url": "https://example.com/baseline/ethiopia-1.jpg",
          "isPrimary": true,
          "sortOrder": 0
        },
        {
          "id": "<uuid-2>",
          "url": "https://example.com/baseline/ethiopia-2.jpg",
          "isPrimary": false,
          "sortOrder": 1
        }
      ],
      "variants": [
        {
          "id": "<uuid-3>",
          "sku": "BASELINE-ETH-250G",
          "weight": 250,
          "unit": "G",
          "name": "250.000G",
          "price": 12.5,
          "discountType": null,
          "discountValue": null,
          "quantity": 40
        },
        {
          "id": "<uuid-4>",
          "sku": "BASELINE-ETH-1KG",
          "weight": 1,
          "unit": "KG",
          "name": "1.000KG",
          "price": 40,
          "discountType": "PERCENT",
          "discountValue": 10,
          "quantity": 12
        }
      ]
    },
    {
      "id": "<product:colombia>",
      "categoryId": "<category:espresso>",
      "name": "Baseline Colombia Supremo",
      "slug": "baseline-colombia-supremo",
      "description": null,
      "roastLevel": "MEDIUM",
      "isOrganic": false,
      "isFairTrade": false,
      "status": "ACTIVE",
      "tastingNotes": null,
      "origin": null,
      "processingMethod": null,
      "createdAt": "<timestamp>",
      "images": [],
      "variants": [
        {
          "id": "<uuid-5>",
          "sku": "BASELINE-COL-500G",
          "weight": 500,
          "unit": "G",
          "name": "500.000G",
          "price": 20,
          "discountType": null,
          "discountValue": null,
          "quantity": 25
        }
      ]
    },
    {
      "id": "<product:kenya>",
      "categoryId": "<category:filter>",
      "name": "Baseline Kenya AA",
      "slug": "baseline-kenya-aa",
      "description": null,
      "roastLevel": "LIGHT",
      "isOrganic": false,
      "isFairTrade": false,
      "status": "DRAFT",
      "tastingNotes": null,
      "origin": null,
      "processingMethod": null,
      "createdAt": "<timestamp>",
      "images": [],
      "variants": []
    }
  ],
  "meta": {
    "limit": 10,
    "currentPage": 1,
    "pageCount": 1,
    "totalCount": 4
  }
}
```

### 6. product: get by id with images and variants

- Request: `GET /api/v1/products/<product:ethiopia>`
- Caller: public (no session)
- Status: **200**

```json
{
  "data": {
    "id": "<product:ethiopia>",
    "categoryId": "<category:espresso>",
    "name": "Baseline Ethiopia Yirgacheffe",
    "slug": "baseline-ethiopia-yirgacheffe",
    "description": null,
    "roastLevel": "LIGHT",
    "isOrganic": true,
    "isFairTrade": false,
    "status": "ACTIVE",
    "tastingNotes": "Jasmine, bergamot, lemon",
    "origin": "Ethiopia",
    "processingMethod": "Washed",
    "createdAt": "<timestamp>",
    "images": [
      {
        "id": "<uuid-1>",
        "url": "https://example.com/baseline/ethiopia-1.jpg",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": "<uuid-2>",
        "url": "https://example.com/baseline/ethiopia-2.jpg",
        "isPrimary": false,
        "sortOrder": 1
      }
    ],
    "variants": [
      {
        "id": "<uuid-3>",
        "sku": "BASELINE-ETH-250G",
        "weight": 250,
        "unit": "G",
        "name": "250.000G",
        "price": 12.5,
        "discountType": null,
        "discountValue": null,
        "quantity": 40
      },
      {
        "id": "<uuid-4>",
        "sku": "BASELINE-ETH-1KG",
        "weight": 1,
        "unit": "KG",
        "name": "1.000KG",
        "price": 40,
        "discountType": "PERCENT",
        "discountValue": 10,
        "quantity": 12
      }
    ]
  }
}
```

### 7. user: list

- Request: `GET /api/v1/users`
- Caller: ADMIN
- Status: **200**

```json
{
  "data": [
    {
      "id": "<user:admin>",
      "email": "admin@baseline.test",
      "firstName": "Baseline",
      "lastName": "Admin",
      "role": "ADMIN",
      "status": "ACTIVE",
      "avatarUrl": null
    },
    {
      "id": "<user:member>",
      "email": "member@baseline.test",
      "firstName": "Baseline",
      "lastName": "Member",
      "role": "USER",
      "status": "ACTIVE",
      "avatarUrl": null
    },
    {
      "id": "<user:target>",
      "email": "target@baseline.test",
      "firstName": "Baseline",
      "lastName": "Target",
      "role": "USER",
      "status": "ACTIVE",
      "avatarUrl": null
    }
  ],
  "meta": {
    "limit": 10,
    "currentPage": 1,
    "pageCount": 1,
    "totalCount": 3
  }
}
```

### 8. user: get by id

- Request: `GET /api/v1/users/<user:target>`
- Caller: ADMIN
- Status: **200**

```json
{
  "data": {
    "id": "<user:target>",
    "email": "target@baseline.test",
    "firstName": "Baseline",
    "lastName": "Target",
    "role": "USER",
    "status": "ACTIVE",
    "avatarUrl": null
  }
}
```

### 9. user: me

- Request: `GET /api/v1/users/me`
- Caller: USER (regular)
- Status: **200**

```json
{
  "data": {
    "id": "<user:member>",
    "email": "member@baseline.test",
    "firstName": "Baseline",
    "lastName": "Member",
    "role": "USER",
    "status": "ACTIVE",
    "avatarUrl": null
  }
}
```

### 10. category: create

- Request: `POST /api/v1/categories`
- Caller: ADMIN
- Status: **201**

```json
{
  "data": {
    "id": "<category:created>",
    "name": "Baseline Cold Brew",
    "slug": "baseline-cold-brew",
    "createdAt": "<timestamp>"
  }
}
```

### 11. category: update

- Request: `PATCH /api/v1/categories/<category:created>`
- Caller: ADMIN
- Status: **200**

```json
{
  "data": {
    "id": "<category:created>",
    "name": "Baseline Cold Brew Renamed",
    "slug": "baseline-cold-brew-renamed",
    "createdAt": "<timestamp>"
  }
}
```

### 12. category: delete

- Request: `DELETE /api/v1/categories/<category:created>`
- Caller: ADMIN
- Status: **204**

(empty body)

### 13. product: create

- Request: `POST /api/v1/products`
- Caller: ADMIN
- Status: **201**

```json
{
  "data": {
    "id": "<product:created>",
    "categoryId": "<category:filter>",
    "name": "Baseline Guatemala Antigua",
    "slug": "baseline-guatemala-antigua",
    "description": null,
    "roastLevel": "MEDIUM",
    "isOrganic": false,
    "isFairTrade": false,
    "status": "ACTIVE",
    "tastingNotes": null,
    "origin": null,
    "processingMethod": null,
    "createdAt": "<timestamp>",
    "images": [
      {
        "id": "<uuid-7>",
        "url": "https://example.com/baseline/guatemala-1.jpg",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "variants": [
      {
        "id": "<uuid-8>",
        "sku": "BASELINE-GUA-250G",
        "weight": 250,
        "unit": "G",
        "name": "250G",
        "price": 14.5,
        "discountType": "FIXED",
        "discountValue": 1.5,
        "quantity": 30
      }
    ]
  }
}
```

### 14. product: update

- Request: `PATCH /api/v1/products/<product:created>`
- Caller: ADMIN
- Status: **200**

```json
{
  "data": {
    "id": "<product:created>",
    "categoryId": "<category:filter>",
    "name": "Baseline Guatemala Antigua Reserve",
    "slug": "baseline-guatemala-antigua-reserve",
    "description": null,
    "roastLevel": "MEDIUM",
    "isOrganic": false,
    "isFairTrade": false,
    "status": "INACTIVE",
    "tastingNotes": null,
    "origin": null,
    "processingMethod": null,
    "createdAt": "<timestamp>",
    "images": [
      {
        "id": "<uuid-7>",
        "url": "https://example.com/baseline/guatemala-1.jpg",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "variants": [
      {
        "id": "<uuid-8>",
        "sku": "BASELINE-GUA-250G",
        "weight": 250,
        "unit": "G",
        "name": "250G",
        "price": 14.5,
        "discountType": "FIXED",
        "discountValue": 1.5,
        "quantity": 30
      }
    ]
  }
}
```

### 15. product: delete

- Request: `DELETE /api/v1/products/<product:created>`
- Caller: ADMIN
- Status: **204**

(empty body)

### 16. user: update

- Request: `PATCH /api/v1/users/<user:target>`
- Caller: ADMIN
- Status: **200**

```json
{
  "data": {
    "id": "<user:target>",
    "email": "target@baseline.test",
    "firstName": "Updated",
    "lastName": "Target",
    "role": "USER",
    "status": "INACTIVE",
    "avatarUrl": null
  }
}
```

### 17. user: delete

- Request: `DELETE /api/v1/users/<user:target>`
- Caller: ADMIN
- Status: **204**

(empty body)

### 18. error 400: invalid category name

- Request: `POST /api/v1/categories`
- Caller: ADMIN
- Status: **400**

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "errCode": "minLength",
      "field": "name",
      "message": "name must be longer than or equal to 2 characters",
      "description": "name must be longer than or equal to 2 characters"
    }
  ]
}
```

### 19. error 401: session without a local user

- Request: `GET /api/v1/users`
- Caller: session with no local user
- Status: **401**

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "errors": [
    {
      "errCode": "unauthenticated",
      "field": "",
      "message": "Authentication required",
      "description": "Authentication required"
    }
  ]
}
```

### 20. error 403: category create as non-ADMIN

- Request: `POST /api/v1/categories`
- Caller: USER (regular)
- Status: **403**

```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "errors": [
    {
      "errCode": "forbidden",
      "field": "",
      "message": "You do not have permission to perform this action",
      "description": "You do not have permission to perform this action"
    }
  ]
}
```

### 21. error 404: missing product

- Request: `GET /api/v1/products/00000000-0000-0000-0000-000000000000`
- Caller: public (no session)
- Status: **404**

```json
{
  "statusCode": 404,
  "message": "Item not found",
  "errors": [
    {
      "errCode": "itemNotFound",
      "field": "",
      "message": "Product not found",
      "description": "Product not found"
    }
  ]
}
```

### 22. error 409: duplicate product name

- Request: `POST /api/v1/products`
- Caller: ADMIN
- Status: **409**

```json
{
  "statusCode": 409,
  "message": "Conflict",
  "errors": [
    {
      "errCode": "duplicateResource",
      "field": "",
      "message": "Product name already exists",
      "description": "Product name already exists"
    }
  ]
}
```
