export const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const

/** Default `publicMetadata.role` for new users (applied in `api/webhooks/clerk`). */
export const DEFAULT_USER_PUBLIC_ROLE = Role.USER
