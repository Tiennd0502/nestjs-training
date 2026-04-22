import { PAGE_SIZE } from '@/constants/common'
import { USER_ROLES } from '@/types/user'

const VALID_PRODUCT_STATUSES = [
  'DRAFT',
  'ACTIVE',
  'INACTIVE',
  'ARCHIVED',
] as const

type ProductStatusParam = (typeof VALID_PRODUCT_STATUSES)[number]

function isValidProductStatus(value: string): value is ProductStatusParam {
  return (VALID_PRODUCT_STATUSES as readonly string[]).includes(value)
}

export function parseListPageParam(value: string | null): number {
  const n = Number.parseInt(value ?? '1', 10)
  if (!Number.isFinite(n) || n < 1) return 1
  return n
}

export function parseListSearchParam(value: string | null): string {
  return value ?? ''
}

export function parseListLimitParam(value: string | null): number {
  if (value == null || value === '') return PAGE_SIZE
  const n = Number.parseInt(value, 10)
  if (!Number.isFinite(n) || n < 1) return PAGE_SIZE
  return n
}

export function parseListCategoryIdParam(value: string | null): string | null {
  const categoryId = value?.trim()
  if (!categoryId) return null
  return categoryId
}

export function parseListStatusParam(
  value: string | null,
): ProductStatusParam | null {
  const status = value?.trim()
  if (!status) return null
  return isValidProductStatus(status) ? status : null
}

export function parseUsersListRoleParam(
  value: string | null,
): USER_ROLES | null {
  const v = value?.trim()
  if (!v) return null
  if (v === USER_ROLES.ADMIN || v === USER_ROLES.USER) return v
  return null
}

export const urlSchema = {
  page: parseListPageParam,
  search: parseListSearchParam,
  limit: parseListLimitParam,
}

export const userUrlSchema = {
  ...urlSchema,
  role: parseUsersListRoleParam,
} as const

export const productUrlSchema = {
  ...urlSchema,
  categoryId: parseListCategoryIdParam,
  status: parseListStatusParam,
} as const
