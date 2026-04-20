import { ERROR_MESSAGES } from '@/constants/messages'
import { API_ROUTES } from '@/constants/routes'
import { fetchUsers } from '@/services/user'
import { USER_ROLES } from '@/types/user'

describe('fetchUsers', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('calls users endpoint and returns parsed users', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ id: 'u-1', email: 'user@example.com', role: 'USER' }],
      }),
    } as globalThis.Response)
    globalThis.fetch = fetchMock as typeof fetch

    const result = await fetchUsers()

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_ROUTES.USERS}`,
      expect.objectContaining({
        headers: { Accept: 'application/json' },
        credentials: 'include',
      }),
    )
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.users).toHaveLength(1)
      expect(result.users[0].role).toBe(USER_ROLES.USER)
    }
  })

  it('appends page and limit as query params when provided', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    } as globalThis.Response)
    globalThis.fetch = fetchMock as typeof fetch

    await fetchUsers({ page: 2, limit: 15 })

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_ROUTES.USERS}?page=2&limit=15`,
      expect.any(Object),
    )
  })

  it('appends search and role query params when provided', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    } as globalThis.Response)
    globalThis.fetch = fetchMock as typeof fetch

    await fetchUsers({ search: '  ada  ', role: 'ADMIN' })

    const calledUrl = String(fetchMock.mock.calls[0]?.[0])
    expect(calledUrl.startsWith(`${API_ROUTES.USERS}?`)).toBe(true)
    expect(calledUrl).toContain('search=ada')
    expect(calledUrl).toContain('role=ADMIN')
  })

  it('returns http error when response is not ok', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
    } as globalThis.Response)
    globalThis.fetch = fetchMock as typeof fetch

    const result = await fetchUsers()

    expect(result).toEqual({
      ok: false,
      error: 'Could not load users (403)',
      status: 403,
    })
  })

  it('returns network error when fetch throws non-error value', async () => {
    const fetchMock = jest.fn().mockRejectedValue('boom')
    globalThis.fetch = fetchMock as typeof fetch

    const result = await fetchUsers()

    expect(result).toEqual({ ok: false, error: ERROR_MESSAGES.NETWORK_ERROR })
  })
})
