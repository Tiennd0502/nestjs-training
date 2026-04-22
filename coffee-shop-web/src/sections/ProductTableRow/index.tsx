'use client'

import { Pencil, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  PRODUCT_STATUS,
  ROAST_LEVEL,
  type Product,
  type ProductImagePayload,
} from '@/types/product'
import { formatPrice } from '@/utils/common'
import { cn } from '@/utils/styles'
import { type OptionItem } from '@/types/common'

type ProductWithCategoryName = Product & {
  categoryName?: string | null
  category?: { name?: string | null } | null
}

function readProductCategory(
  product: ProductWithCategoryName,
  categoryOptions: OptionItem[],
): string {
  const category = categoryOptions.find(
    (option) => String(option.value) === product.categoryId,
  )
  if (!category) return '—'
  return category.label
}

function readProductPrice(product: Product): number {
  const firstVariant = product.variants[0]
  if (!firstVariant) return 0
  return Number.isFinite(firstVariant.price) ? firstVariant.price : 0
}

function readProductStock(product: Product): number {
  return product.variants.reduce((total, variant) => {
    const quantity = Number.isFinite(variant.quantity) ? variant.quantity : 0
    return total + quantity
  }, 0)
}

function readProductImageUrl(images: ProductImagePayload[]): string | null {
  if (images.length === 0) return null
  const primary = images.find((image) => image.isPrimary)
  const first = primary ?? images[0]
  const url = first?.url?.trim() ?? ''
  return url || null
}

function formatRoastLevel(level: Product['roastLevel']): string {
  switch (level) {
    case ROAST_LEVEL.LIGHT:
      return 'Light Roast'
    case ROAST_LEVEL.MEDIUM:
      return 'Medium Roast'
    case ROAST_LEVEL.DARK:
      return 'Dark Roast'
    default:
      return 'Unknown roast'
  }
}

function getStatusStyles(status: PRODUCT_STATUS): string {
  switch (status) {
    case PRODUCT_STATUS.ACTIVE:
      return 'bg-emerald-100 text-emerald-700'
    case PRODUCT_STATUS.INACTIVE:
      return 'bg-muted text-muted-foreground'
    case PRODUCT_STATUS.ARCHIVED:
      return 'bg-foreground/10 text-foreground/70'
    default:
      return 'bg-amber-100 text-amber-700'
  }
}

export interface ProductTableRowProps {
  product: Product
  categoryOptions: OptionItem[]
}

export function ProductTableRow({
  product,
  categoryOptions,
}: ProductTableRowProps) {
  const productName = product.name?.trim() || 'Untitled product'
  const categoryLabel = readProductCategory(product, categoryOptions)
  const roastLevel = formatRoastLevel(product.roastLevel)
  const origin = product.origin?.trim() || 'Unknown origin'
  const status = product.status ?? PRODUCT_STATUS.DRAFT
  const stock = readProductStock(product)
  const price = readProductPrice(product)
  const imageUrl = readProductImageUrl(product.images)

  return (
    <>
      <td className="min-w-0 px-6 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="size-14 shrink-0 overflow-hidden rounded-sm bg-muted">
            <Avatar className="size-14 rounded-sm after:rounded-sm after:border-transparent">
              <AvatarImage
                src={imageUrl ?? ''}
                alt={productName}
                className="rounded-sm"
              />
              <AvatarFallback className="rounded-sm text-xs font-semibold">
                {productName.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="min-w-0 space-y-0.5 text-left">
            <p className="font-semibold leading-tight text-foreground">
              {productName}
            </p>
            <p className="text-sm text-muted-foreground">
              {origin} • {roastLevel}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <Badge variant="secondary" className="h-7 px-6 text-sm font-semibold">
          {categoryLabel}
        </Badge>
      </td>
      <td className="px-6 py-4 text-center">
        <p className="text-sm font-semibold text-foreground">
          {formatPrice(price, 'en-US', 'USD')}
        </p>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-center font-semibold text-foreground">
          {stock}
        </p>
      </td>
      <td className="px-6 py-4 text-center">
        <Badge
          className={cn(
            'h-7 px-3 text-[0.65rem] uppercase',
            getStatusStyles(status),
          )}
        >
          {status}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-end gap-1">
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label={`Edit ${productName}`}
            disabled
          >
            <Pencil className="size-4" aria-hidden />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label={`Delete ${productName}`}
            disabled
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      </td>
    </>
  )
}
