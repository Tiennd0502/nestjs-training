export interface User {
  id?: string
  email: string | null
  firstName: string | null
  lastName: string | null
  name: string | null
  imageUrl: string | null
}

export interface ClerkUser extends User {
  fullName: string | null
  primaryEmailAddress?: { emailAddress: string } | null
}
