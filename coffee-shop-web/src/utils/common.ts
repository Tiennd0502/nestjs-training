import { type Category } from '@/types/category'
import { type OptionItem } from '@/types/common'

/**
 * Formats a numeric amount as currency for display (e.g. price labels).
 * @param amount - The amount to format.
 * @param locale - The locale to format the amount in.
 * @param currency - The currency to format the amount in.
 * @returns The formatted amount.
 */
export const formatPrice = (
  amount: number,
  locale = 'en-US',
  currency = 'USD',
): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

/**
 * Returns up to 2 initials from first and last name.
 * @param firstName - The first name to get initials from.
 * @param lastName - The last name to get initials from.
 * @returns The initials of the first and last name.
 */
export const getNameInitials = (
  firstName?: string | null,
  lastName?: string | null,
): string => {
  const first = firstName?.trim().charAt(0) ?? ''
  const last = lastName?.trim().charAt(0) ?? ''

  return `${first}${last}`.toUpperCase()
}

export const renderProductSku = ({
  weight,
  unit,
}: {
  weight: number
  unit: string
}): string => {
  const safeWeight =
    Number.isFinite(weight) && weight > 0 ? String(weight) : '0'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const suffix = Array.from({ length: 4 }, () => {
    return chars[Math.floor(Math.random() * chars.length)]
  }).join('')
  const safeUnit = unit.trim().toUpperCase() || 'U'

  return `PRD-${safeWeight}${safeUnit}-${suffix}`
}

export const ONLY_TEXT_REGEX = /^[A-Za-z/ ]+$/

export const toAlphaOnly = (value: string): string =>
  value.replace(/[^A-Za-z/ ]/g, '')

const formatThousandsRegex = /\B(?=(\d{3})+(?!\d))/g

export const normalizeNumericInput = (value: string): string => {
  if (!value) return ''

  const sanitized = value.replaceAll(',', '').replaceAll(' ', '')
  const isNegative = sanitized.startsWith('-')
  const unsigned = sanitized.replaceAll('-', '')
  const hasDecimalPoint = unsigned.includes('.')
  const [integerPartRaw, ...decimalParts] = unsigned.split('.')
  const integerPart = integerPartRaw.replaceAll(/\D/g, '')
  const decimalPart = decimalParts.join('').replaceAll(/\D/g, '')

  if (!integerPart && hasDecimalPoint) {
    if (!decimalPart) return `${isNegative ? '-' : ''}.`
    return `${isNegative ? '-' : ''}.${decimalPart}`
  }

  const baseInteger =
    integerPart.length > 0 ? integerPart : decimalPart.length > 0 ? '0' : ''
  if (!baseInteger && !decimalPart) return ''

  const prefixedInteger = `${isNegative ? '-' : ''}${baseInteger}`
  if (!decimalPart) return prefixedInteger

  return `${prefixedInteger}.${decimalPart}`
}

export const formatNumericWithThousands = (raw: string): string => {
  if (!raw) return ''

  const isNegative = raw.startsWith('-')
  const unsigned = isNegative ? raw.slice(1) : raw
  const [integerPart, decimalPart] = unsigned.split('.')
  const formattedInteger = integerPart.replaceAll(formatThousandsRegex, ',')
  const prefixedInteger = `${isNegative ? '-' : ''}${formattedInteger}`

  if (decimalPart === undefined) return prefixedInteger

  return `${prefixedInteger}.${decimalPart}`
}

export const getCategoryOptions = (categories: Category[]): OptionItem[] =>
  categories
    .filter((category) => Boolean(category.id))
    .map((category) => ({
      value: category.id,
      label: category.name?.trim() ? category.name : category.slug,
    }))
