import { ERROR_MESSAGES } from '@/constants/messages'
import { API_ROUTES } from '@/constants/routes'
import type { Category } from '@/types/category'
import type { Response, ResponseMeta } from '@/types/api'

export interface CategoryOptions {
  getToken?: () => Promise<string | null>
  page?: number
  limit?: number
  search?: string
}

export async function fetchCategories(
  options: CategoryOptions = {},
): Promise<
  | { ok: true; categories: Category[]; meta?: ResponseMeta }
  | { ok: false; error: string; status?: number }
> {
  const { getToken, page, limit, search } = options
  const headers: HeadersInit = { Accept: 'application/json' }
  const token = getToken ? await getToken() : null
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const url = new URL(API_ROUTES.CATEGORIES)
  if (page !== undefined) {
    url.searchParams.set('page', String(page))
  }
  if (limit !== undefined) {
    url.searchParams.set('limit', String(limit))
  }
  if (search !== undefined && search.trim() !== '') {
    url.searchParams.set('search', search.trim())
  }

  try {
    const res = await fetch(url.toString(), { headers, credentials: 'include' })
    if (!res.ok) {
      return {
        ok: false,
        error: `Could not load categories (${res.status})`,
        status: res.status,
      }
    }

    const { data, meta }: Response<Category[]> = await res.json()

    return {
      ok: true,
      categories: data,
      meta: meta,
    }
  } catch (e) {
    const message =
      e instanceof Error ? e.message : ERROR_MESSAGES.NETWORK_ERROR
    return { ok: false, error: message }
  }
}
