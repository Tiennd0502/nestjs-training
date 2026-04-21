export const ERROR_MESSAGES = {
  IDENTIFIER_REQUIRED: 'Enter your email address',
  IDENTIFIER_EMAIL_INVALID: 'Enter a valid email address',
  PASSWORD_REQUIRED: 'Enter your password',
  EMAIL_ADDRESS_REQUIRED: 'Enter your email address',
  EMAIL_ADDRESS_INVALID: 'Enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  FIRST_NAME_REQUIRED: 'Enter your first name',
  LAST_NAME_REQUIRED: 'Enter your last name',
  DATE_OF_BIRTH_REQUIRED: 'Enter your date of birth',
  DATE_OF_BIRTH_INVALID: 'Enter a valid date of birth',
  DATE_OF_BIRTH_FUTURE: 'Date of birth cannot be in the future',
  DATE_OF_BIRTH_UNDER_MINIMUM_AGE: 'You must be at least 18 years old',
  SIGN_OUT_FAILED: 'Logout failed. Something went wrong.',
  UNEXPECTED_PROFILE_RESPONSE: 'Unexpected profile response',
  NETWORK_ERROR: 'Network error',
  FIELD_REQUIRED: 'This field is required',
  CATEGORY_NAME_MAX: 'Name must be at most 120 characters',
} as const

export const API_FALLBACK_ERRORS = {
  CATEGORY_CREATE: 'Could not create category',
  CATEGORY_DELETE: 'Could not delete category',
  CATEGORIES_LOAD: 'Could not load categories',
  USERS_LOAD: 'Could not load users',
  USER_DELETE: 'Could not delete user',
  PROFILE_LOAD: 'Could not load profile',
} as const

export const SUCCESS_MESSAGES = {
  SIGNED_OUT: 'Signed out successfully',
  CATEGORY_CREATED: 'Category created',
  CATEGORY_DELETED: 'Category removed',
}

export const DIALOG_MESSAGES = {
  CATEGORY: {
    DELETE: {
      TITLE: 'Remove this category?',
      ACTION: 'Remove',
      DESCRIPTION: (name: string, slug: string) =>
        `This will remove ${name} (${slug}). It may still appear in this list with the Removed badge.`,
    },
  },
}
