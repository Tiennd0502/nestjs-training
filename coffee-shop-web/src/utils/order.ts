import { Banknote, Package, Truck } from 'lucide-react'

import type { StatCardItem } from '@/components/StatsCards'
import type { ResponseMeta } from '@/types/api'
import { ORDER_STATUS, SHIPPING_STATUS, type Order } from '@/types/order'

import { formatPrice } from './common'

export function formatOrderCustomerName(order: Order): string {
  const { firstName, lastName } = order.addressSnapshot
  const full = [firstName, lastName].map((s) => s?.trim()).filter(Boolean)
  return full.length > 0 ? full.join(' ') : '—'
}

export function formatOrderListDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
}

export function getOrderStatusPresentation(status: ORDER_STATUS): {
  label: string
  badgeClassName: string
} {
  switch (status) {
    case ORDER_STATUS.PENDING:
      return {
        label: 'Pending',
        badgeClassName:
          'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200',
      }
    case ORDER_STATUS.CONFIRMED:
      return {
        label: 'Confirmed',
        badgeClassName:
          'bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-200',
      }
    case ORDER_STATUS.COMPLETED:
      return {
        label: 'Completed',
        badgeClassName:
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200',
      }
    case ORDER_STATUS.CANCELLED:
      return {
        label: 'Cancelled',
        badgeClassName: 'bg-muted text-muted-foreground',
      }
    default:
      return {
        label: String(status),
        badgeClassName: 'bg-muted text-muted-foreground',
      }
  }
}

export function getShippingStatusPresentation(status: SHIPPING_STATUS): {
  label: string
  badgeClassName: string
} {
  switch (status) {
    case SHIPPING_STATUS.PENDING:
      return {
        label: 'Pending',
        badgeClassName:
          'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200',
      }
    case SHIPPING_STATUS.SHIPPING:
      return {
        label: 'Shipping',
        badgeClassName:
          'bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-200',
      }
    case SHIPPING_STATUS.DELIVERED:
      return {
        label: 'Delivered',
        badgeClassName:
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200',
      }
    case SHIPPING_STATUS.RETURNED:
      return {
        label: 'Returned',
        badgeClassName:
          'bg-orange-100 text-orange-900 dark:bg-orange-950/40 dark:text-orange-200',
      }
    default:
      return {
        label: String(status),
        badgeClassName: 'bg-muted text-muted-foreground',
      }
  }
}

export function buildOrderDashboardStats(
  orders: Order[],
  meta: ResponseMeta | null,
): StatCardItem[] {
  const totalCount = meta?.totalCount ?? orders.length
  const pageIsPartial =
    meta != null && orders.length > 0 && meta.totalCount > orders.length

  const processing = orders.filter(
    (o) => o.status === ORDER_STATUS.PENDING,
  ).length
  const shipped = orders.filter(
    (o) => o.shippingStatus === SHIPPING_STATUS.SHIPPING,
  ).length
  const revenueSum = orders.reduce(
    (sum, o) => sum + (Number.isFinite(o.totalAmount) ? o.totalAmount : 0),
    0,
  )

  const partialNote = pageIsPartial ? 'Based on orders on this page' : undefined

  return [
    {
      id: 'total-orders',
      label: 'Total orders',
      value: totalCount,
      footnote: partialNote,
      footnoteTone: 'muted',
    },
    {
      id: 'processing',
      label: 'Processing',
      value: processing,
      footnote: partialNote ?? 'Current active batches',
      footnoteIcon: Package,
      footnoteTone: partialNote ? 'muted' : 'muted',
    },
    {
      id: 'shipped',
      label: 'Shipped',
      value: shipped,
      footnote: partialNote ?? 'In transit to customers',
      footnoteIcon: Truck,
      footnoteTone: 'muted',
    },
    {
      id: 'revenue',
      label: 'Revenue',
      value: formatPrice(revenueSum),
      footnote: partialNote ?? 'Net earnings (current page)',
      variant: 'accent',
      icon: Banknote,
      footnoteTone: 'muted',
    },
  ]
}
