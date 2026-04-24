'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { CartLineItem } from '@/components/CartLineItem'
import { CartSummaryCard } from '@/components/CartSummaryCard'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { useCartStore } from '@/store/useCartStore'

export default function CartPageContent() {
  const router = useRouter()
  const {
    items,
    totals,
    isLoading,
    isError,
    errorMessage,
    changeQuantity,
    removeItem,
    refetch,
  } = useCartStore()

  const handleCheckout = () => {
    toast.info('Checkout will be available soon.', {
      description: `Total ${totals.total.toFixed(2)} USD`,
    })
  }

  const handleContinueShopping = () => {
    router.push('/roasts')
  }

  if (isLoading) {
    return (
      <div
        className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12"
        data-testid="cart-loading"
      >
        <div className="mb-8 space-y-2">
          <div className="h-11 w-80 animate-pulse rounded-md bg-surface-container-high" />
          <div className="h-6 w-60 animate-pulse rounded-md bg-surface-container-high" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <div className="h-40 animate-pulse rounded-3xl bg-surface-container-high" />
            <div className="h-40 animate-pulse rounded-3xl bg-surface-container-high" />
          </div>
          <div className="h-84 animate-pulse rounded-3xl bg-surface-container-high" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div
        className="mx-auto max-w-4xl px-4 py-16 text-center md:px-6"
        data-testid="cart-error"
      >
        <h1 className="text-3xl font-semibold text-on-surface">
          Your Sensory Cart
        </h1>
        <p className="mt-4 text-on-surface-variant">
          {errorMessage ?? 'Unable to load your cart right now.'}
        </p>
        <Button className="mt-6 w-auto px-8" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const hasItems = items.length > 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <section className="space-y-2" aria-label="Cart heading">
        <h1 className="text-4xl font-semibold text-on-surface md:text-5xl">
          Your Sensory Cart
        </h1>
        <p className="text-lg text-on-surface-variant">
          {hasItems
            ? `${items.length} items selected for your next brewing experience.`
            : 'No items selected for your next brewing experience.'}
        </p>
      </section>

      {!hasItems ? (
        <section className="mt-10 rounded-3xl border border-outline-variant/70 bg-surface-container-low p-10 text-center">
          <p className="text-xl text-on-surface">Your cart is empty.</p>
          <p className="mt-2 text-on-surface-variant">
            Browse our roasts and gear to build your next sensory ritual.
          </p>
          <Button
            className="mt-6 w-auto px-8"
            onClick={() => router.push(ROUTES.HOME)}
          >
            Continue Shopping
          </Button>
        </section>
      ) : (
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <section className="space-y-4" aria-label="Cart line items">
            {items.map((item) => (
              <CartLineItem
                key={item.id}
                item={item}
                onChangeQuantity={changeQuantity}
                onRemove={removeItem}
              />
            ))}
          </section>

          <CartSummaryCard
            totals={totals}
            onCheckout={handleCheckout}
            onContinueShopping={handleContinueShopping}
            isCheckoutDisabled={!hasItems}
          />
        </div>
      )}
    </div>
  )
}
