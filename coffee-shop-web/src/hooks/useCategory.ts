'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import {
  LIST_QUERY_GC_MS,
  LIST_QUERY_STALE_MS,
  PAGE_SIZE,
} from '@/constants/common'
import { fetchCategories, type CategoryOptions } from '@/services/category'
import type { Category } from '@/types/category'
import type { ResponseMeta } from '@/types/api'

export interface UseCategoriesResult {
  categories: Category[]
  meta: ResponseMeta | null
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
  refetch: () => Promise<void>
}

export function categoriesListQueryKey(params: CategoryOptions) {
  return [
    'categories',
    'list',
    params.page ?? 1,
    params.limit ?? PAGE_SIZE,
    params.search ?? '',
  ] as const
}

export const useCategories = (
  params: CategoryOptions = {},
): UseCategoriesResult => {
  const query = useQuery({
    queryKey: categoriesListQueryKey(params),
    queryFn: async () => {
      const result = await fetchCategories(params)
      if (!result.ok) {
        throw new Error(result.error)
      }
      return {
        categories: result.categories,
        meta: result.meta ?? null,
      }
    },
    staleTime: LIST_QUERY_STALE_MS,
    gcTime: LIST_QUERY_GC_MS,
    placeholderData: keepPreviousData,
  })

  return {
    categories: query.data?.categories ?? [],
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
