import { formatPrice } from '../common'

describe('formatPrice', () => {
  it('formats en-US USD with two fraction digits', () => {
    expect(formatPrice(15, 'en-US', 'USD')).toBe('$15.00')
    expect(formatPrice(45, 'en-US', 'USD')).toBe('$45.00')
  })

  it('formats zero', () => {
    expect(formatPrice(0, 'en-US', 'USD')).toBe('$0.00')
  })

  it('rounds to two decimal places', () => {
    expect(formatPrice(15.2, 'en-US', 'USD')).toBe('$15.20')
    expect(formatPrice(15.999, 'en-US', 'USD')).toBe('$16.00')
  })

  it('formats another locale and currency', () => {
    const formatted = formatPrice(1234.5, 'de-DE', 'EUR')
    expect(formatted).toMatch(/1/)
    expect(formatted).toMatch(/234/)
    expect(formatted).toMatch(/50/)
  })
})
