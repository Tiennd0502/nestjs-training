import { ROUTES } from './routes'
import { User, LogOut } from 'lucide-react'

export const USER_DROPDOWNS = [
  {
    text: 'Profile',
    Icon: User,
    href: ROUTES.USER_PROFILE,
  },
  {
    text: 'Sign out',
    Icon: LogOut,
    href: '/',
    isSignOut: true,
  },
]

export const USER_DROPDOWNS_LENGTH = USER_DROPDOWNS.length
