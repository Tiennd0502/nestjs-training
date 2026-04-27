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

  if (!result.data || typeof result.data !== 'object') {
    return {
      ok: false,
      error: ERROR_MESSAGES.UNEXPECTED_PROFILE_RESPONSE,
    }
  }

  const root = result.data as Record<string, unknown>
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

  if (!id) {
    return {
      ok: false,
      error: ERROR_MESSAGES.UNEXPECTED_PROFILE_RESPONSE,
    }
  }

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
  const addressCandidates = [
    payload.address,
    payload.shippingAddress,
    payload.shipping_address,
  ]
  const addressPayload = (addressCandidates.find(
    (candidate) =>
      candidate !== null &&
      typeof candidate === 'object' &&
      !Array.isArray(candidate),
  ) ?? null) as Record<string, unknown> | null
  const address = addressPayload
    ? {
        firstName:
          readString(addressPayload.firstName) ??
          readString(addressPayload.first_name),
        lastName:
          readString(addressPayload.lastName) ??
          readString(addressPayload.last_name),
        phoneNumber:
          readString(addressPayload.phoneNumber) ??
          readString(addressPayload.phone_number),
        addressLine:
          readString(addressPayload.addressLine) ??
          readString(addressPayload.address_line) ??
          readString(addressPayload.address) ??
          readString(addressPayload.line1) ??
          readString(addressPayload.street),
        district: readString(addressPayload.district),
        ward: readString(addressPayload.ward),
        city: readString(addressPayload.city),
        postalCode:
          readString(addressPayload.postalCode) ??
          readString(addressPayload.postal_code) ??
          readString(addressPayload.zipCode) ??
          readString(addressPayload.zip_code),
        isDefault:
          typeof addressPayload.isDefault === 'boolean'
            ? addressPayload.isDefault
            : typeof addressPayload.is_default === 'boolean'
              ? addressPayload.is_default
              : null,
      }
    : null
  const role = getRole(payload.role)
  const status = getStatus(payload.status)
  const user: User = {
    id,
    email,
    firstName,
    lastName,
    address,
    name,
    avatarUrl: imageUrl,
    role,
    status,
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
