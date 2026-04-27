'use client'

import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { CartItem, CartTotals } from '@/types/cart'
import { formatCurrency } from '@/utils/cart'
import { cn } from '@/utils/styles'

export interface CheckoutOrderSummaryProps {
  items: CartItem[]
  totals: CartTotals
  onPlaceOrder: () => void
  isPlacingOrder?: boolean
  isPlaceOrderDisabled?: boolean
  className?: string
}

export const CheckoutOrderSummary = ({
  items,
  totals,
  onPlaceOrder,
  isPlacingOrder = false,
  isPlaceOrderDisabled = false,
  className,
}: CheckoutOrderSummaryProps) => {
  return (
    <aside
      className={cn(
        'rounded-[2rem] border border-outline-variant/70 bg-surface-container-low p-6 shadow-sm md:p-8',
        className,
      )}
    >
      <h2 className="text-3xl font-semibold text-on-surface">Order Summary</h2>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <article key={item.id} className="flex items-center gap-3">
            <div className="relative size-16 overflow-hidden rounded-lg bg-surface-container">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-on-surface">
                {item.name}
              </p>
              <p className="truncate text-sm text-on-surface-variant">
                {item.meta}
              </p>
              <p className="mt-1 font-semibold text-primary">
                {formatCurrency(item.unitPrice)}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="my-6 h-px bg-outline-variant/60" />

      <dl className="space-y-2 text-on-surface-variant">
        <div className="flex items-center justify-between gap-2">
          <dt>Subtotal</dt>
          <dd>{formatCurrency(totals.subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt>Shipping</dt>
          <dd>
            {totals.shipping === null
              ? 'Free'
              : formatCurrency(totals.shipping)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt>Estimated Tax</dt>
          <dd>{formatCurrency(totals.tax)}</dd>
        </div>
      </dl>

      <div className="my-6 h-px bg-outline-variant/60" />

      <div className="flex items-center justify-between gap-2">
        <p className="text-xl font-semibold text-on-surface">Total</p>
        <p className="text-xl font-bold text-primary">
          {formatCurrency(totals.total)}
        </p>
      </div>

      <Button
        type="button"
        loading={isPlacingOrder}
        disabled={isPlaceOrderDisabled}
        className="mt-8 h-14 rounded-full text-base"
        onClick={onPlaceOrder}
      >
        Place Order
        <ShoppingBag className="size-4" aria-hidden />
      </Button>
      <p className="mt-6 text-center text-xs text-on-surface-variant">
        By placing your order, you agree to CoffeeHub&apos;s Terms of Service
        and Privacy Policy.
      </p>
    </aside>
  )
}
