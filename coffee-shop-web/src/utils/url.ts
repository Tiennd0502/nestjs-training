import { PAGE_SIZE } from '@/constants/common'
import { USER_ROLES } from '@/types/user'

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
