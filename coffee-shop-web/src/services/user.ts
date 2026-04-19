import type { User } from '@/types/user'

import { ERROR_MESSAGES } from '@/constants/messages'
import { API_ROUTES } from '@/constants/routes'

function readString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  return null
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

  return {
    id,
    email,
    firstName,
    lastName,
    name,
    imageUrl,
  }
}

export async function fetchAuthUser(
  getToken?: () => Promise<string | null>,
): Promise<
  { ok: true; user: User } | { ok: false; error: string; status?: number }
> {
  const headers: HeadersInit = { Accept: 'application/json' }
  const token = getToken ? await getToken() : null
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const res = await fetch(API_ROUTES.ME, { headers, credentials: 'include' })
    if (!res.ok) {
      return {
        ok: false,
        error: `Could not load profile (${res.status})`,
        status: res.status,
      }
    }
    const json: unknown = await res.json()
    const user = parseAuthUserPayload(json)
    if (!user) {
      return {
        ok: false,
        error: ERROR_MESSAGES.UNEXPECTED_PROFILE_RESPONSE,
      }
    }
    return { ok: true, user }
  } catch (e) {
    const message =
      e instanceof Error ? e.message : ERROR_MESSAGES.NETWORK_ERROR
    return { ok: false, error: message }
  }
}
