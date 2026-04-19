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
} as const

export const SUCCESS_MESSAGES = {
  SIGNED_OUT: 'Signed out successfully',
}
