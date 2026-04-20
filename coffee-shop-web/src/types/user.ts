export enum USER_ROLES {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum USER_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface User {
  id?: string
  email: string | null
  firstName: string | null
  lastName: string | null
  name: string | null
  imageUrl: string | null
  role?: USER_ROLES
  status?: USER_STATUS
}

export interface ClerkUser extends User {
  fullName: string | null
  primaryEmailAddress?: { emailAddress: string } | null
}
