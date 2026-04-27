'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { toast } from 'sonner'

import AlertDialog from '@/components/AlertDialog'
import Breadcrumb from '@/components/Breadcrumb'
import Table from '@/components/Table'
import { PaginationBar } from '@/components/Pagination'
import { SearchInput } from '@/components/SearchInput'
import { Select } from '@/components/Select'
import StatsCards from '@/components/StatsCards'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { SEARCH_URL_DEBOUNCE_MS } from '@/constants/common'
import {
  DIALOG_MESSAGES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '@/constants/messages'
import {
  ALL_ORDER_STATUSES_VALUE,
  // ALL_SHIPPING_STATUS_VALUE,
  ORDER_STATUS_FILTER_OPTIONS,
  ORDERS_TABLE_COLUMNS,
  // SHIPPING_STATUS_OPTIONS,
} from '@/constants/order'
import { ROUTES } from '@/constants/routes'
import {
  useDeleteOrder,
  useOrders,
  useUpdateOrderShippingStatus,
  useUpdateOrderStatus,
} from '@/hooks/useOrder'
import type { ORDER_STATUS, Order, SHIPPING_STATUS } from '@/types/order'
import { useUrlState } from '@/hooks/useUrlState'
import { OrderDetailModal } from '@/sections/OrderDetailModal'
import { OrderTableRow } from '@/sections/OrderTableRow'
import { buildOrderDashboardStats } from '@/utils/order'
import { ordersUrlSchema } from '@/utils/url'

export default function OrdersPageContent() {
  const { state, update: updateUrl } = useUrlState(ordersUrlSchema)
  const { page, search, limit, status, shippingStatus } = state
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searchInput, setSearchInput] = useState(search)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Order | null>(null)
  const [pendingStatusOrderId, setPendingStatusOrderId] = useState<
    string | null
  >(null)
  const [pendingShippingStatusOrderId, setPendingShippingStatusOrderId] =
    useState<string | null>(null)
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(
    null,
  )
  const { mutate: deleteOrderMutate, isPending: isDeletePending } =
    useDeleteOrder()
  const { mutate: updateOrderStatusMutate } = useUpdateOrderStatus()
  const { mutate: updateOrderShippingStatusMutate } =
    useUpdateOrderShippingStatus()
  const updateUrlRef = useRef(updateUrl)
  const urlSearchRef = useRef(search)
  const lastUrlSearchSynced = useRef<string | null>(null)
  updateUrlRef.current = updateUrl
  urlSearchRef.current = search

  useEffect(() => {
    if (lastUrlSearchSynced.current === null) {
      lastUrlSearchSynced.current = search
      return
    }
    if (search === lastUrlSearchSynced.current) return
    lastUrlSearchSynced.current = search
    if (searchInputRef.current === document.activeElement) return
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (searchInput === urlSearchRef.current) return
      updateUrlRef.current({ search: searchInput, page: 1 })
    }, SEARCH_URL_DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [searchInput])

  const { orders, meta, isLoading, isError, errorMessage, refetch } = useOrders(
    {
      page,
      limit,
      search: search.trim(),
      status: status ?? undefined,
      shippingStatus: shippingStatus ?? undefined,
    },
  )

  const totalPages = Math.max(1, meta?.pageCount ?? 1)
  const totalCount = meta?.totalCount ?? orders.length
  const showingCount = orders.length

  useEffect(() => {
    if (page > totalPages) {
      updateUrl({ page: totalPages })
    }
  }, [page, totalPages, updateUrl])

  const handleStatusChange = (value: unknown) => {
    if (typeof value !== 'string') return
    updateUrl({
      status: value === ALL_ORDER_STATUSES_VALUE ? null : value,
      page: 1,
    })
  }

  // const handleShippingStatusChange = (value: unknown) => {
  //   if (typeof value !== 'string') return
  //   updateUrl({
  //     shippingStatus: value === ALL_SHIPPING_STATUS_VALUE ? null : value,
  //     page: 1,
  //   })
  // }

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value)
  }

  const handleOrderStatusUpdate = (order: Order, nextStatus: ORDER_STATUS) => {
    const orderId = order.id
    setPendingStatusOrderId(orderId)
    updateOrderStatusMutate(
      { id: orderId, status: nextStatus },
      {
        onSuccess: () => {
          toast.success(SUCCESS_MESSAGES.ORDER_STATUS_UPDATED)
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : ERROR_MESSAGES.NETWORK_ERROR,
          )
        },
        onSettled: () => {
          setPendingStatusOrderId((current) =>
            current === orderId ? null : current,
          )
        },
      },
    )
  }

  const handleOrderShippingStatusUpdate = (
    order: Order,
    nextShippingStatus: SHIPPING_STATUS,
  ) => {
    const orderId = order.id
    setPendingShippingStatusOrderId(orderId)
    updateOrderShippingStatusMutate(
      { id: orderId, shippingStatus: nextShippingStatus },
      {
        onSuccess: () => {
          toast.success(SUCCESS_MESSAGES.ORDER_SHIPPING_STATUS_UPDATED)
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : ERROR_MESSAGES.NETWORK_ERROR,
          )
        },
        onSettled: () => {
          setPendingShippingStatusOrderId((current) =>
            current === orderId ? null : current,
          )
        },
      },
    )
  }

  const statsItems = buildOrderDashboardStats(orders, meta)
  const pendingOrderNumber = pendingDelete?.orderNumber?.trim()
  const pendingOrderLabelRaw =
    pendingOrderNumber && pendingOrderNumber.length > 0
      ? pendingOrderNumber
      : (pendingDelete?.id ?? '')
  const pendingOrderLabel = pendingOrderLabelRaw
    ? pendingOrderLabelRaw.startsWith('#')
      ? pendingOrderLabelRaw
      : `#${pendingOrderLabelRaw}`
    : '#unknown'

  return (
    <div className="flex flex-col gap-6">
      <OrderDetailModal
        order={selectedOrder}
        open={selectedOrder !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOrder(null)
          }
        }}
      />

      <AlertDialog
        data-testid="modal-confirm-delete-order"
        open={pendingDelete !== null}
        isLoading={isDeletePending}
        errorMessage={deleteErrorMessage}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null)
            setDeleteErrorMessage(null)
          }
        }}
        title={DIALOG_MESSAGES.ORDER.DELETE.TITLE}
        description={DIALOG_MESSAGES.ORDER.DELETE.DESCRIPTION(
          pendingOrderLabel,
        )}
        textAction={DIALOG_MESSAGES.ORDER.DELETE.ACTION}
        onClickAction={() => {
          const id = pendingDelete?.id
          if (!id) return
          setDeleteErrorMessage(null)
          deleteOrderMutate(id, {
            onSuccess: () => {
              toast.success(SUCCESS_MESSAGES.ORDER_DELETED)
              setPendingDelete(null)
              setDeleteErrorMessage(null)
            },
            onError: (error) => {
              setDeleteErrorMessage(
                error instanceof Error
                  ? error.message
                  : ERROR_MESSAGES.NETWORK_ERROR,
              )
            },
          })
        }}
      />

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-3">
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: ROUTES.DASHBOARD },
              { label: 'Orders', href: ROUTES.DASHBOARD_ORDERS },
            ]}
          />
          <div className="space-y-2">
            <h1 className="text-5xl leading-tight font-bold tracking-tight text-foreground">
              Orders
            </h1>
            <p className="text-lg text-muted-foreground">
              Track fulfillment, payments, and customer deliveries.
            </p>
          </div>
        </div>
      </header>

      <StatsCards items={statsItems} />

      <section className="overflow-hidden rounded-3xl border border-outline-variant/40 bg-card">
        <div className="flex flex-col gap-3 border-b border-outline-variant/30 p-4 md:flex-row md:flex-wrap lg:items-center lg:justify-between">
          <SearchInput
            ref={searchInputRef}
            value={searchInput}
            onChange={handleQueryChange}
            placeholder="Search orders..."
            aria-label="Search orders"
            containerClassName="h-12 bg-surface-container-high w-full md:max-w-sm"
          />
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="w-full flex gap-4 md:w-50 md:max-w-80">
              <Select
                classNameTrigger="h-12 rounded-full"
                placeholder="All statuses"
                options={ORDER_STATUS_FILTER_OPTIONS}
                selected={status ?? ALL_ORDER_STATUSES_VALUE}
                onValueChange={handleStatusChange}
              />
            </div>
            {/* <div className="w-full flex gap-4 md:w-60 md:max-w-60">
              <Select
                classNameTrigger="h-12 rounded-full"
                placeholder="All shipping statuses"
                options={SHIPPING_STATUS_OPTIONS}
                selected={shippingStatus ?? ALL_SHIPPING_STATUS_VALUE}
                onValueChange={handleShippingStatusChange}
              />
            </div> */}
            <Button
              disabled
              variant="outline"
              size="icon"
              aria-label="Export orders"
              className="size-11"
            >
              <Download className="size-4" aria-hidden />
            </Button>
            <Button
              disabled
              variant="outline"
              size="icon"
              aria-label="Print orders"
              className="size-11"
            >
              <Printer className="size-4" aria-hidden />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center px-6 py-12 text-muted-foreground">
            <Spinner
              size="lg"
              label="Loading orders"
              className="text-primary"
            />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <p className="text-muted-foreground">{errorMessage}</p>
            <Button
              className="w-fit px-6"
              variant="destructive"
              size="sm"
              onClick={() => void refetch()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <Table
            columns={ORDERS_TABLE_COLUMNS}
            data={orders}
            getRowKey={(order, index) => order.id ?? `order-${index}`}
            renderRow={(order) => (
              <OrderTableRow
                order={order}
                isDeleteDisabled={isDeletePending}
                isStatusDisabled={pendingStatusOrderId === order.id}
                isShippingStatusDisabled={
                  pendingShippingStatusOrderId === order.id
                }
                onRequestDelete={(nextOrder) => {
                  setDeleteErrorMessage(null)
                  setPendingDelete(nextOrder)
                }}
                onRequestView={(nextOrder) => {
                  setSelectedOrder(nextOrder)
                }}
                onRequestStatusChange={handleOrderStatusUpdate}
                onRequestShippingStatusChange={handleOrderShippingStatusUpdate}
              />
            )}
            emptyMessage="No orders found."
            tableClassName="w-full min-w-[960px] table-fixed text-left"
          />
        )}

        <footer className="border-t border-outline-variant/30 px-6 py-4">
          <PaginationBar
            currentPage={Math.min(page, totalPages)}
            totalPages={totalPages}
            onPageChange={(next) => updateUrl({ page: next })}
            showingCount={showingCount}
            totalCount={totalCount}
            entityLabel="orders"
          />
        </footer>
      </section>
    </div>
  )
}
