export const ERROR_MESSAGES = {
  USER: {
    EMAIL_EXISTS: 'Email already exists',
    CLERK_ID_EXISTS: 'Clerk id already exists',
    NOT_FOUND: 'User not found',
    PAGE_OUT_OF_RANGE: 'Requested page exceeds the available range',
  },
  WEBHOOK: {
    INVALID_SIGNATURE: 'Invalid webhook signature',
  },
  AUTH: {
    UNAUTHENTICATED: 'Authentication required',
    INACTIVE_ACCOUNT: 'Account is inactive',
    FORBIDDEN: 'You do not have permission to perform this action',
  },
  CATEGORY: {
    NOT_FOUND: 'Category not found',
    NAME_EXISTS: 'Category name already exists',
  },
  PRODUCT_IMAGE: {
    NOT_FOUND: 'Product image not found',
  },
  PRODUCT_VARIANT: {
    NOT_FOUND: 'Product variant not found',
    SKU_EXISTS: 'SKU already exists',
  },
  PRODUCT: {
    NOT_FOUND: 'Product not found',
    NAME_EXISTS: 'Product name already exists',
  },
} as const;
