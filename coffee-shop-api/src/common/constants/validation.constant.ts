export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  SKU: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
  IMAGE: {
    MAX_COUNT: 6,
    MIN_SORT_ORDER: 0,
  },
  QUANTITY: {
    MIN: 0,
  },
  PRICE: {
    MIN: 0,
  },
  PAGINATION: {
    MIN_PAGE: 1,
    DEFAULT_PAGE: 1,
    MIN_LIMIT: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
} as const;
