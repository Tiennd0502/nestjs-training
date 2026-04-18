import { z } from 'zod'

import { ERROR_MESSAGES } from '@/constants/messages'

const formDataEntryToString = (value: FormDataEntryValue | null): string => {
  if (value === null) {
    return ''
  }
  if (typeof value === 'string') {
    return value
  }
  return ''
}

export const signInCredentialsSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, ERROR_MESSAGES.IDENTIFIER_REQUIRED)
    .email(ERROR_MESSAGES.IDENTIFIER_EMAIL_INVALID),
  password: z.string().trim().min(1, ERROR_MESSAGES.PASSWORD_REQUIRED),
})

export type SignInCredentialsValues = z.infer<typeof signInCredentialsSchema>

export const parseSignInCredentialsForm = (formData: FormData) =>
  signInCredentialsSchema.safeParse({
    identifier: formDataEntryToString(formData.get('identifier')),
    password: formDataEntryToString(formData.get('password')),
  })
