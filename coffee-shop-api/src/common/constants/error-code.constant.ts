export const ERROR_CODES = {
  INVALID_REQUEST: 'invalidRequest',
  UNAUTHENTICATED: 'unauthenticated',
  FORBIDDEN: 'forbidden',
  ITEM_NOT_FOUND: 'itemNotFound',
  DUPLICATE_RESOURCE: 'duplicateResource',
  INTERNAL_SERVER_ERROR: 'internalServerError',
  UNKNOWN_ERROR: 'error',
  CATEGORY: {
    NAME_EXISTS: 'categoryNameExists',
    NOT_FOUND: 'categoryNotFound',
  },
  USER: {
    EMAIL_EXISTS: 'userEmailExists',
    CLERK_ID_EXISTS: 'userClerkIdExists',
    NOT_FOUND: 'userNotFound',
  },
  PRODUCT: {
    NAME_EXISTS: 'productNameExists',
    NOT_FOUND: 'productNotFound',
  },
  PRODUCT_VARIANT: {
    SKU_EXISTS: 'productVariantSkuExists',
    NOT_FOUND: 'productVariantNotFound',
  },
  PRODUCT_IMAGE: {
    NOT_FOUND: 'productImageNotFound',
  },
  PAGINATION: {
    PAGE_OUT_OF_RANGE: 'pageOutOfRange',
  },
} as const;
