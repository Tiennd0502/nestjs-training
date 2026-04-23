import type { Product } from '@/types/product'

export function getProductListPrice(product: Product): number {
  const firstVariant = product.variants[0]
  if (!firstVariant) return 0
  return Number.isFinite(firstVariant.price) ? firstVariant.price : 0
}

export function getProductPrimaryImageUrl(product: Product): string | null {
  if (product.images.length === 0) return null
  const primary = product.images.find((image) => image.isPrimary)
  const first = primary ?? product.images[0]
  const url = first?.url?.trim() ?? ''
  return url || null
}
