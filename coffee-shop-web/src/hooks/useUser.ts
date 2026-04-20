'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import {
  LIST_QUERY_GC_MS,
  LIST_QUERY_STALE_MS,
  PAGE_SIZE,
} from '@/constants/common'
import { fetchUsers, type FetchUsersOptions } from '@/services/user'
import type { User } from '@/types/user'
import { type ResponseMeta } from '@/types/api'

export type UseUsersParams = FetchUsersOptions

export interface UseUserResult {
  users: User[]
  meta: ResponseMeta | null
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
  refetch: () => Promise<void>
}

export function usersListQueryKey(params: FetchUsersOptions) {
  return [
    'users',
    'list',
    params.page ?? 1,
    params.limit ?? PAGE_SIZE,
    params.search ?? '',
    params.role ?? '',
  ] as const
}

export const useUsers = (params: UseUsersParams = {}): UseUserResult => {
  const query = useQuery({
    queryKey: usersListQueryKey(params),
    queryFn: async () => {
      const result = await fetchUsers(params)
      if (!result.ok) {
        throw new Error(result.error)
      }
      return {
        users: result.users,
        meta: result.meta ?? null,
      }
    },
    staleTime: LIST_QUERY_STALE_MS,
    gcTime: LIST_QUERY_GC_MS,
    placeholderData: keepPreviousData,
  })

  return {
    users: query.data?.users ?? [],
    meta: query.data?.meta ?? null,
    isLoading: !query.data && query.isFetching,
    isError: query.isError,
    errorMessage:
      query.isError && query.error instanceof Error
        ? query.error.message
        : query.isError
          ? String(query.error)
          : null,
    refetch: async () => {
      await query.refetch()
    },
  }
}
