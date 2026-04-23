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
  deleteProduct,
  fetchProductById,
  fetchProducts,
  updateProduct,
  type ProductOptions,
} from '@/services/product'
import type { ResponseMeta } from '@/types/api'
import type {
  Product,
  ProductPayload,
  ProductUpdatePayload,
} from '@/types/product'

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

const detailQueryOptions = {
  staleTime: LIST_QUERY_STALE_MS,
  gcTime: LIST_QUERY_GC_MS,
} as const

export function productDetailQueryKey(id: string) {
  return ['products', 'detail', id] as const
}

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

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteProduct(id)
      if (!result.ok) throwIfServiceFailed(result)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productsQueryRoot })
    },
  })
}

export interface UseProductByIdResult {
  product: Product | null
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
  refetch: () => Promise<void>
}

export function useProductById(id: string): UseProductByIdResult {
  const query = useQuery({
    queryKey: productDetailQueryKey(id),
    queryFn: async () => {
      const result = await fetchProductById(id)
      if (!result.ok) throwIfServiceFailed(result)
      return result.product
    },
    enabled: Boolean(id?.trim()),
    ...detailQueryOptions,
  })

  return {
    product: query.data ?? null,
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

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { id: string; body: ProductUpdatePayload }) => {
      const result = await updateProduct(input.id, input.body)
      if (!result.ok) throwIfServiceFailed(result)
      return result.product
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: productsQueryRoot })
      void queryClient.invalidateQueries({
        queryKey: productDetailQueryKey(variables.id.trim()),
      })
    },
  })
}
