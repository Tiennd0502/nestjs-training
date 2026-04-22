import { DISCOUNT_TYPE } from '@/types/product'

export const DISCOUNT_TYPE_OPTIONS: {
  value: DISCOUNT_TYPE
  label: string
}[] = [
  { value: DISCOUNT_TYPE.PERCENT, label: 'Percent' },
  { value: DISCOUNT_TYPE.FIXED, label: 'Fixed' },
]
