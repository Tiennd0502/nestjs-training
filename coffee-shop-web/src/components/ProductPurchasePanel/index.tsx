'use client'

import { Heart, Minus, Plus, ShoppingCart } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import type { Product } from '@/types/product'
import { cn } from '@/utils/styles'

const QUANTITY_CAP = 99

export interface ProductPurchasePanelProps {
  product: Product
  className?: string
}

export function ProductPurchasePanel({
  product,
  className,
}: ProductPurchasePanelProps) {
  const productName = product.name
  const maxQuantity = product.variants[0]?.quantity ?? 1
  const effectiveMax = Math.max(1, Math.min(maxQuantity, QUANTITY_CAP))
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    setQuantity((q) => Math.min(q, effectiveMax))
  }, [effectiveMax])

  const decrement = useCallback(() => {
    setQuantity((q) => Math.max(1, q - 1))
  }, [])

  const increment = useCallback(() => {
    setQuantity((q) => Math.min(effectiveMax, q + 1))
  }, [effectiveMax])

  const handleAddToCart = () => {
    toast.info('Cart checkout is coming soon.', {
      description: `${quantity} × ${productName}`,
    })
  }

  const handleWishlist = () => {
    toast.info('Wishlist is coming soon.', {
      description: productName,
    })
  }

  return (
    <div
      className={cn('w-full space-y-4', className)}
      data-testid="product-purchase-panel"
    >
      <div className="flex w-full gap-6">
        <div
          className="inline-flex h-13 items-center rounded-full border border-outline-variant/80 bg-surface-container-low/90 px-1 dark:bg-surface-container-high/80"
          role="group"
          aria-label="Quantity"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-10 rounded-full"
            aria-label="Decrease quantity"
            onClick={decrement}
            disabled={quantity <= 1}
          >
            <Minus className="size-4" aria-hidden />
          </Button>
          <span
            className="min-w-10 text-center text-sm font-semibold text-on-surface tabular-nums"
            aria-live="polite"
          >
            {quantity}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-10 rounded-full"
            aria-label="Increase quantity"
            onClick={increment}
            disabled={quantity >= effectiveMax}
          >
            <Plus className="size-4" aria-hidden />
          </Button>
        </div>

        <Button
          type="button"
          className="flex-1 h-14 w-auto w-max-content rounded-2xl text-base font-bold shadow-md"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="size-4" aria-hidden />
          Add to Cart
        </Button>
      </div>

      <div className="flex w-full flex-col gap-3">
        <Button
          disabled
          type="button"
          variant="outline"
          className="h-12 w-full rounded-2xl border-2 border-primary bg-transparent font-semibold text-primary hover:bg-primary/5 dark:hover:bg-primary/10"
          onClick={handleWishlist}
        >
          <Heart className="size-4" aria-hidden />
          Add to Wishlist
        </Button>
      </div>
    </div>
  )
}
