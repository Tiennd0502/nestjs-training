/**
 * Formats a numeric amount as currency for display (e.g. price labels).
 * @param amount - The amount to format.
 * @param locale - The locale to format the amount in.
 * @param currency - The currency to format the amount in.
 * @returns The formatted amount.
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
