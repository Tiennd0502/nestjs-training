'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { EMPTY_IMAGE } from '@/constants/images'

import { Button } from '@/components/ui/button'
import { useProductById } from '@/hooks/useProduct'
import { formatPrice } from '@/utils/common'
import {
  getProductListPrice,
  mapProductToRoastCollection,
} from '@/utils/product'

const ROASTS_LIST_HREF = '/roasts'

export default function RoastDetailPageContent() {
  const params = useParams()
  const rawId = params?.id
  const id =
    typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] : ''

  const { product, isLoading, isError, errorMessage, refetch } =
    useProductById(id)

  if (!id?.trim()) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <p className="text-on-surface-variant">Missing product id.</p>
        <Link
          href={ROASTS_LIST_HREF}
          className="mt-4 inline-block font-semibold text-primary underline-offset-4 hover:underline"
        >
          Back to roasts
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div
        className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8 md:py-12"
        data-testid="roast-detail-loading"
      >
        <div className="h-10 w-40 animate-pulse rounded-md bg-surface-container-high" />
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-4xl bg-surface-container-high" />
          <div className="space-y-4">
            <div className="h-10 w-3/4 animate-pulse rounded-md bg-surface-container-high" />
            <div className="h-8 w-32 animate-pulse rounded-md bg-surface-container-high" />
            <div className="h-24 animate-pulse rounded-md bg-surface-container-high" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 text-center md:px-8 md:py-12">
        <p className="text-on-surface-variant">
          {errorMessage ?? 'Unable to load this roast.'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => void refetch()} variant="outline">
            Retry
          </Button>
          <Link
            href={ROASTS_LIST_HREF}
            className="inline-flex h-12 items-center justify-center rounded-full px-4 text-sm font-semibold text-primary hover:opacity-90"
          >
            Back to roasts
          </Link>
        </div>
      </div>
    )
  }

  const collection = mapProductToRoastCollection(product, EMPTY_IMAGE)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <nav className="mb-8">
        <Link
          href={ROASTS_LIST_HREF}
          className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          ← All roasts
        </Link>
      </nav>

      <article className="grid gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-4xl bg-surface-container">
          <Image
            src={collection.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="font-headline text-3xl leading-tight text-on-surface md:text-4xl">
            {product.name}
          </h1>
          <p className="text-2xl font-bold text-primary">
            {formatPrice(getProductListPrice(product))}
          </p>
          <p className="text-sm font-medium uppercase tracking-wider text-on-surface-variant">
            {collection.flavorNotes}
          </p>
          <p className="text-xs uppercase tracking-wider text-on-surface-variant">
            {collection.roastMeta}
          </p>
          {product.description?.trim() ? (
            <p className="text-on-surface">{product.description.trim()}</p>
          ) : null}
        </div>
      </article>
    </div>
  )
}
