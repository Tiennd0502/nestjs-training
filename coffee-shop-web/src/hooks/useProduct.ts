'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createProduct } from '@/services/product'
import type { ProductPayload } from '@/types/product'

function throwIfServiceFailed(result: { ok: false; error: string }): never {
  throw new Error(result.error)
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
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
