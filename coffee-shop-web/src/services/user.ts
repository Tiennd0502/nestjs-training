import type { User } from '@/types/user'
import { USER_ROLES, USER_STATUS } from '@/types/user'
import type { Response, ResponseMeta } from '@/types/api'

import { API_FALLBACK_ERRORS, ERROR_MESSAGES } from '@/constants/messages'
import { API_ROUTES } from '@/constants/routes'
import { apiClient } from '@/services/api'

export interface FetchUsersOptions {
  getToken?: () => Promise<string | null>
  page?: number
  limit?: number
  search?: string
  role?: string
}

function readString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  return null
}

function getRole(value: unknown): User['role'] {
  if (typeof value !== 'string') return undefined

  const normalized = value.trim().toUpperCase()
  if (normalized === USER_ROLES.ADMIN || normalized === 'MANAGER') {
    return USER_ROLES.ADMIN
  }
  if (normalized === USER_ROLES.USER || normalized === 'BARISTA') {
    return USER_ROLES.USER
  }

  return undefined
}

function getStatus(value: unknown): User['status'] {
  if (typeof value !== 'string') return undefined

  const normalized = value.trim().toUpperCase()
  if (normalized === USER_STATUS.ACTIVE) {
    return USER_STATUS.ACTIVE
  }
  if (normalized === USER_STATUS.INACTIVE) {
    return USER_STATUS.INACTIVE
  }

  return undefined
}

export function parseAuthUserPayload(body: unknown): User | null {
  if (!body || typeof body !== 'object') return null
  const root = body as Record<string, unknown>
  const payload =
    root.data !== undefined &&
    root.data !== null &&
    typeof root.data === 'object'
      ? (root.data as Record<string, unknown>)
      : root

  const id =
    readString(payload.id) ??
    readString(payload.userId) ??
    readString(payload.sub) ??
    (typeof payload.email === 'string' && payload.email.trim()
      ? payload.email.trim()
      : null)

  if (!id) return null

  const firstName =
    readString(payload.firstName) ?? readString(payload.first_name)
  const lastName = readString(payload.lastName) ?? readString(payload.last_name)
  const email = readString(payload.email)
  const joined = [firstName, lastName].filter(Boolean).join(' ').trim()
  const name = readString(payload.name) ?? (joined.length > 0 ? joined : null)
  const imageUrl =
    readString(payload.imageUrl) ??
    readString(payload.image_url) ??
    readString(payload.avatarUrl) ??
    readString(payload.avatar_url) ??
    readString(payload.picture)
  const role = getRole(payload.role)
  const status = getStatus(payload.status)

  return {
    id,
    email,
    firstName,
    lastName,
    name,
    imageUrl,
    role,
    status,
  }
}

export async function fetchUser(
  getToken?: () => Promise<string | null>,
): Promise<
  { ok: true; user: User } | { ok: false; error: string; status?: number }
> {
  const result = await apiClient.get<unknown>(API_ROUTES.ME, {
    getToken,
    fallbackError: API_FALLBACK_ERRORS.PROFILE_LOAD,
  })
  if (!result.ok) return result

  const user = parseAuthUserPayload(result.data)
  if (!user) {
    return {
      ok: false,
      error: ERROR_MESSAGES.UNEXPECTED_PROFILE_RESPONSE,
    }
  }
  return { ok: true, user }
}

export async function fetchUsers(
  options: FetchUsersOptions = {},
): Promise<
  | { ok: true; users: User[]; meta?: ResponseMeta }
  | { ok: false; error: string; status?: number }
> {
  const { getToken, page, limit, search, role } = options
  const result = await apiClient.get<Response<User[]>>(API_ROUTES.USERS, {
    getToken,
    query: {
      page,
      limit,
      search: search?.trim(),
      role: role?.trim(),
    },
    fallbackError: API_FALLBACK_ERRORS.USERS_LOAD,
  })
  if (!result.ok) return result

  const { data, meta } = result.data
  return { ok: true, users: data, meta }
}
