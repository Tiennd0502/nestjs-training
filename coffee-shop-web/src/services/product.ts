import { API_FALLBACK_ERRORS } from '@/constants/messages'
import { API_ROUTES } from '@/constants/routes'
import type { Response as ApiResponse, ResponseMeta } from '@/types/api'
import { apiClient } from '@/services/api'
import type { Product, ProductPayload } from '@/types/product'

export interface ProductOptions {
  getToken?: () => Promise<string | null>
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  status?: string
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

export async function fetchProducts(
  options: ProductOptions = {},
): Promise<
  | { ok: true; products: Product[]; meta?: ResponseMeta }
  | { ok: false; error: string; status?: number }
> {
  const { getToken, page, limit, search, categoryId, status } = options
  const result = await apiClient.get<ApiResponse<Product[]>>(
    API_ROUTES.PRODUCTS,
    {
      getToken,
      query: {
        page,
        limit,
        search: search?.trim(),
        categoryId: categoryId?.trim(),
        status: status?.trim(),
      },
      fallbackError: API_FALLBACK_ERRORS.PRODUCTS_LOAD,
    },
  )
  if (!result.ok) return result

  const { data, meta } = result.data
  return { ok: true, products: data, meta }
}

export async function deleteProduct(
  id: string,
  options: Pick<ProductOptions, 'getToken'> = {},
): Promise<{ ok: true } | { ok: false; error: string; status?: number }> {
  const trimmed = id.trim()
  const url = `${API_ROUTES.PRODUCTS}/${encodeURIComponent(trimmed)}`
  const result = await apiClient.delete(url, {
    getToken: options.getToken,
    fallbackError: API_FALLBACK_ERRORS.PRODUCT_DELETE,
  })
  if (!result.ok) return result
  return { ok: true }
}
