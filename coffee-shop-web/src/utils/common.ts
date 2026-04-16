/**
 * Formats a numeric amount as currency for display (e.g. price labels).
 */
export const formatPrice = (
  amount: number,
  locale: string,
  currency: string,
): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
