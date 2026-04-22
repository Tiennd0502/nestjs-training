import { z } from 'zod'

import { ERROR_MESSAGES } from '@/constants/messages'
import { DISCOUNT_TYPE, ROAST_LEVEL } from '@/types/product'
import { ONLY_TEXT_REGEX } from '@/utils/common'

const nonNegativeNumber = (field: string) =>
  z
    .number({ error: field })
    .refine((value) => Number.isFinite(value) && value >= 0, {
      message: field,
    })

const greaterThanZeroNumber = (message: string) =>
  z
    .number({ error: ERROR_MESSAGES.FIELD_REQUIRED })
    .refine((value) => Number.isFinite(value) && value > 0, {
      message,
    })

export const createProductFormSchema = z
  .object({
    categoryId: z
      .string()
      .trim()
      .min(1, { message: ERROR_MESSAGES.FIELD_REQUIRED }),
    name: z.string().trim().min(1, { message: ERROR_MESSAGES.FIELD_REQUIRED }),
    description: z
      .string()
      .trim()
      .min(1, { message: ERROR_MESSAGES.FIELD_REQUIRED }),
    roastLevel: z.enum([
      ROAST_LEVEL.LIGHT,
      ROAST_LEVEL.MEDIUM,
      ROAST_LEVEL.DARK,
    ]),
    isOrganic: z.boolean(),
    isFairTrade: z.boolean(),
    weight: greaterThanZeroNumber('Weight must be greater than 0'),
    unit: z
      .string()
      .trim()
      .min(1, { message: ERROR_MESSAGES.FIELD_REQUIRED })
      .max(10, { message: 'Unit must be at most 10 characters' })
      .regex(ONLY_TEXT_REGEX, {
        message: 'Unit must contain text only',
      }),
    price: greaterThanZeroNumber('Base price must be greater than 0'),
    discountType: z.nativeEnum(DISCOUNT_TYPE),
    discountValue: nonNegativeNumber(ERROR_MESSAGES.DISCOUNT_PERCENT_MIN),
    quantity: z
      .number({ error: ERROR_MESSAGES.FIELD_REQUIRED })
      .int({ message: 'Quantity must be a whole number' })
      .min(1, { message: 'Quantity must be at least 1' }),
    origin: z
      .string()
      .trim()
      .min(1, { message: ERROR_MESSAGES.FIELD_REQUIRED }),
    processingMethod: z
      .string()
      .trim()
      .min(1, { message: ERROR_MESSAGES.FIELD_REQUIRED }),
  })
  .superRefine((data, ctx) => {
    if (
      data.discountType === DISCOUNT_TYPE.PERCENT &&
      data.discountValue > 100
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discountValue'],
        message: ERROR_MESSAGES.DISCOUNT_PERCENT_MAX,
      })
    }

    if (
      data.discountType === DISCOUNT_TYPE.FIXED &&
      data.discountValue >= data.price
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discountValue'],
        message: ERROR_MESSAGES.DISCOUNT_FIXED_MUST_BE_LESS_THAN_PRICE,
      })
    }
  })

export type CreateProductFormValues = z.infer<typeof createProductFormSchema>
