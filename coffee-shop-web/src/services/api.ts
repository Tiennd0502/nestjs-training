import { ERROR_MESSAGES } from '@/constants/messages'

type TokenGetter = () => Promise<string | null>

type QueryValue = string | number | boolean | null | undefined

export interface ApiRequestOptions {
  getToken?: TokenGetter
  query?: Record<string, QueryValue>
  fallbackError: string
}

export type ApiResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: string; status?: number }

export class ApiClient {
  private buildUrlWithQuery(
    url: string,
    query?: Record<string, QueryValue>,
  ): string {
    if (!query) return url

    const next = new URL(url)
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue
      next.searchParams.set(key, String(value))
    }

    return next.toString()
  }

  private pickFirstErrorsEntryMessage(
    root: Record<string, unknown>,
  ): string | null {
    const errors = root.errors
    if (!Array.isArray(errors) || errors.length === 0) return null
    const first = errors[0]
    if (!first || typeof first !== 'object') return null
    const entry = first as Record<string, unknown>
    const description =
      typeof entry.description === 'string' ? entry.description.trim() : ''
    const message =
      typeof entry.message === 'string' ? entry.message.trim() : ''
    const combined = description || message
    return combined || null
  }

  private async readErrorMessage(
    response: globalThis.Response,
    fallback: string,
  ): Promise<string> {
    try {
      const body: unknown = await response.json()
      if (body && typeof body === 'object') {
        const root = body as Record<string, unknown>
        if (response.status === 400) {
          const fromErrors = this.pickFirstErrorsEntryMessage(root)
          if (fromErrors) return fromErrors
        }
        const message = root.message ?? root.error
        if (typeof message === 'string' && message.trim()) {
          return message.trim()
        }
      }
    } catch {
      // Keep fallback when body is empty or non-JSON.
    }
    return fallback
  }

  private async createHeaders(getToken?: TokenGetter): Promise<HeadersInit> {
    const headers: HeadersInit = { Accept: 'application/json' }
    const token = getToken ? await getToken() : null
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    return headers
  }

  async get<T>(url: string, options: ApiRequestOptions): Promise<ApiResult<T>> {
    const { getToken, query, fallbackError } = options
    const headers = await this.createHeaders(getToken)
    const urlWithQuery = this.buildUrlWithQuery(url, query)

    try {
      const response = await fetch(urlWithQuery, {
        headers,
        credentials: 'include',
      })
      if (!response.ok) {
        return {
          ok: false,
          error: await this.readErrorMessage(
            response,
            `${fallbackError} (${response.status})`,
          ),
          status: response.status,
        }
      }
      const data = (await response.json()) as T
      return { ok: true, data, status: response.status }
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR,
      }
    }
  }

  async post<TResponse>(
    url: string,
    body: unknown,
    options: Omit<ApiRequestOptions, 'query'>,
  ): Promise<ApiResult<TResponse>> {
    const { getToken, fallbackError } = options
    const headers = await this.createHeaders(getToken)
    headers['Content-Type'] = 'application/json'

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        return {
          ok: false,
          error: await this.readErrorMessage(
            response,
            `${fallbackError} (${response.status})`,
          ),
          status: response.status,
        }
      }

      let data: TResponse
      try {
        data = (await response.json()) as TResponse
      } catch {
        data = {} as TResponse
      }

      return { ok: true, data, status: response.status }
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR,
      }
    }
  }

  async delete(
    url: string,
    options: Omit<ApiRequestOptions, 'query'>,
  ): Promise<ApiResult<undefined>> {
    const { getToken, fallbackError } = options
    const headers = await this.createHeaders(getToken)

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      })
      if (!response.ok) {
        return {
          ok: false,
          error: await this.readErrorMessage(
            response,
            `${fallbackError} (${response.status})`,
          ),
          status: response.status,
        }
      }

      const raw = await response.text()
      if (raw.trim()) {
        try {
          JSON.parse(raw) as unknown
        } catch {
          // Ignore non-JSON success bodies.
        }
      }

      return { ok: true, data: undefined, status: response.status }
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR,
      }
    }
  }
}
export const apiClient = new ApiClient()

export async function apiGet<T>(
  url: string,
  options: ApiRequestOptions,
): Promise<ApiResult<T>> {
  return apiClient.get<T>(url, options)
}

export async function apiPost<TResponse>(
  url: string,
  body: unknown,
  options: Omit<ApiRequestOptions, 'query'>,
): Promise<ApiResult<TResponse>> {
  return apiClient.post<TResponse>(url, body, options)
}

export async function apiDelete(
  url: string,
  options: Omit<ApiRequestOptions, 'query'>,
): Promise<ApiResult<undefined>> {
  return apiClient.delete(url, options)
}
