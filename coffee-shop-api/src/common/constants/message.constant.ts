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
  EXCEPTION: {
    BAD_REQUEST: 'Bad request',
    UNAUTHORIZED: 'Unauthorized',
    FORBIDDEN: 'Forbidden',
    ITEM_NOT_FOUND: 'Item not found',
    CONFLICT: 'Conflict',
    VALIDATION_FAILED: 'Validation failed',
    SYSTEM_ERROR: 'System error',
    INTERNAL_ERROR: 'An unexpected error occurred. Please try again later.',
  },
} as const;

export const ERROR_DESCRIPTIONS = {
  CATEGORY: {
    NAME_EXISTS:
      'A category with this name already exists. Please choose a different name.',
    NOT_FOUND: 'The category might have been deleted, or the id is incorrect.',
  },
  USER: {
    EMAIL_EXISTS: 'An account with this email already exists.',
    CLERK_ID_EXISTS: 'An account linked to this Clerk id already exists.',
    NOT_FOUND_BY_ID:
      'The user might have been deleted, or the id is incorrect.',
    NOT_FOUND_BY_CLERK_ID:
      'The user might have been deleted, or the clerk id is incorrect.',
  },
} as const;
