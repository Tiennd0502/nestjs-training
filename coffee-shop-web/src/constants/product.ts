import { DISCOUNT_TYPE, PRODUCT_STATUS } from '@/types/product'
import type { TableColumn } from '@/components/Table'

export const DISCOUNT_TYPE_OPTIONS: {
  value: DISCOUNT_TYPE
  label: string
}[] = [
  { value: DISCOUNT_TYPE.PERCENT, label: 'Percent' },
  { value: DISCOUNT_TYPE.FIXED, label: 'Fixed' },
]

export const PRODUCTS_TABLE_COLUMNS: TableColumn[] = [
  {
    key: 'product',
    label: 'Product',
    className: 'w-auto min-w-0 px-6 py-4',
  },
  {
    key: 'category',
    label: 'Category',
    className: 'w-[18%] px-6 py-4 text-center',
  },
  { key: 'price', label: 'Price', className: 'w-[14%] px-6 py-4 text-center' },
  { key: 'stock', label: 'Stock', className: 'w-[10%] px-6 py-4 text-center' },
  {
    key: 'status',
    label: 'Status',
    className: 'w-[12%] px-6 py-4 text-center',
  },
  {
    key: 'actions',
    label: 'Actions',
    className: 'w-27 px-6 py-4 text-center',
  },
]

export const PRODUCT_STATUS_OPTIONS: {
  value: string
  label: string
}[] = [
  { value: 'all-status', label: 'All statuses' },
  { value: PRODUCT_STATUS.DRAFT, label: 'Draft' },
  { value: PRODUCT_STATUS.ACTIVE, label: 'Active' },
  { value: PRODUCT_STATUS.INACTIVE, label: 'Inactive' },
  { value: PRODUCT_STATUS.ARCHIVED, label: 'Archived' },
]
