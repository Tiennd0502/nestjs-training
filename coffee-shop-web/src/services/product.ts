import { API_FALLBACK_ERRORS } from '@/constants/messages'
import { API_ROUTES } from '@/constants/routes'
import { apiClient } from '@/services/api'
import type { Product, ProductPayload } from '@/types/product'

export interface ProductOptions {
  getToken?: () => Promise<string | null>
}

export async function createProduct(
  body: ProductPayload,
  options: ProductOptions = {},
): Promise<
  { ok: true; product: Product } | { ok: false; error: string; status?: number }
> {
  const result = await apiClient.post<unknown>(API_ROUTES.PRODUCTS, body, {
    getToken: options.getToken,
    fallbackError: API_FALLBACK_ERRORS.PRODUCT_CREATE,
  })
  if (!result.ok) return result

  const json = result.data
  let parsedProduct: Product | null = null
  if (json && typeof json === 'object') {
    const root = json as Record<string, unknown>
    const data = root.data
    if (data && typeof data === 'object') {
      parsedProduct = data as Product
    } else {
      parsedProduct = root as unknown as Product
    }
  }

  return {
    ok: true,
    product:
      parsedProduct ??
      ({
        id: '',
        ...body,
        createdAt: null,
        updatedAt: null,
      } as Product),
  }
}
