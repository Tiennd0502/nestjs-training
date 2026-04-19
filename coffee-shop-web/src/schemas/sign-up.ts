import { z } from 'zod'

import { ERROR_MESSAGES } from '@/constants/messages'
import { formDataEntryToString } from '@/utils/validation/form-data'

const toIsoLocalDate = (date: Date): string => {
  const y = date.getFullYear()
  const mo = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${mo}-${d}`
}

const parseCalendarDateString = (value: string): string | null => {
  const trimmed = value.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null
  }
  const [ys, ms, ds] = trimmed.split('-')
  const y = Number(ys)
  const m = Number(ms)
  const d = Number(ds)
  const date = new Date(y, m - 1, d)
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null
  }
  return trimmed
}

const birthdayValueSchema = z
  .string()
  .trim()
  .min(1, ERROR_MESSAGES.DATE_OF_BIRTH_REQUIRED)
  .superRefine((raw, ctx) => {
    const normalized = parseCalendarDateString(raw)
    if (normalized === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: ERROR_MESSAGES.DATE_OF_BIRTH_INVALID,
        path: ['birthday'],
      })
      return
    }

    const today = toIsoLocalDate(new Date())
    if (normalized > today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: ERROR_MESSAGES.DATE_OF_BIRTH_FUTURE,
        path: ['birthday'],
      })
      return
    }

    const cutoff = new Date()
    cutoff.setFullYear(cutoff.getFullYear() - 18)
    const oldestAllowed = toIsoLocalDate(cutoff)
    if (normalized > oldestAllowed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: ERROR_MESSAGES.DATE_OF_BIRTH_UNDER_MINIMUM_AGE,
        path: ['birthday'],
      })
    }
  })

export const signUpStartSchema = z.object({
  firstName: z.string().trim().min(1, ERROR_MESSAGES.FIRST_NAME_REQUIRED),
  lastName: z.string().trim().min(1, ERROR_MESSAGES.LAST_NAME_REQUIRED),
  birthday: birthdayValueSchema,
  emailAddress: z
    .string()
    .trim()
    .min(1, ERROR_MESSAGES.EMAIL_ADDRESS_REQUIRED)
    .email(ERROR_MESSAGES.EMAIL_ADDRESS_INVALID),
  password: z
    .string()
    .trim()
    .min(1, ERROR_MESSAGES.PASSWORD_REQUIRED)
    .min(8, ERROR_MESSAGES.PASSWORD_MIN_LENGTH),
})

export type SignUpStartValues = z.infer<typeof signUpStartSchema>

export const parseSignUpStartForm = (formData: FormData) =>
  signUpStartSchema.safeParse({
    firstName: formDataEntryToString(formData.get('firstName')),
    lastName: formDataEntryToString(formData.get('lastName')),
    birthday: formDataEntryToString(formData.get('birthday')),
    emailAddress: formDataEntryToString(formData.get('emailAddress')),
    password: formDataEntryToString(formData.get('password')),
  })
