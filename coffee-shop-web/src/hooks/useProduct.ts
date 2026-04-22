'use client'

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  LIST_QUERY_GC_MS,
  LIST_QUERY_STALE_MS,
  PAGE_SIZE,
} from '@/constants/common'
import {
  createProduct,
  fetchProducts,
  type ProductOptions,
} from '@/services/product'
import type { ResponseMeta } from '@/types/api'
import type { Product, ProductPayload } from '@/types/product'

function throwIfServiceFailed(result: { ok: false; error: string }): never {
  throw new Error(result.error)
}

export interface UseProductsResult {
  products: Product[]
  meta: ResponseMeta | null
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
  refetch: () => Promise<void>
}

const productsQueryRoot = ['products'] as const

const listQueryOptions = {
  staleTime: LIST_QUERY_STALE_MS,
  gcTime: LIST_QUERY_GC_MS,
  placeholderData: keepPreviousData,
} as const

export function productsListQueryKey(params: ProductOptions) {
  return [
    'products',
    'list',
    params.page ?? 1,
    params.limit ?? PAGE_SIZE,
    params.search ?? '',
    params.categoryId ?? '',
    params.status ?? '',
  ] as const
}

export const useProducts = (params: ProductOptions = {}): UseProductsResult => {
  const query = useQuery({
    queryKey: productsListQueryKey(params),
    queryFn: async () => {
      const result = await fetchProducts(params)
      if (!result.ok) throwIfServiceFailed(result)
      return {
        products: result.products,
        meta: result.meta ?? null,
      }
    },
    ...listQueryOptions,
  })

  return {
    products: query.data?.products ?? [],
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

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: ProductPayload) => {
      const result = await createProduct(body)
      if (!result.ok) throwIfServiceFailed(result)
      return result.product
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productsQueryRoot })
    },
  })
}
