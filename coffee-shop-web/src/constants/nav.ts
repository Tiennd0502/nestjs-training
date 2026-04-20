import {
  User,
  LogOut,
  LayoutDashboard,
  Coffee,
  Heart,
  FileText,
  Settings,
} from 'lucide-react'

import { type MenuItem } from '@/types/menu'
import { ROUTES } from './routes'

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

export const MENU: MenuItem[] = [
  { label: 'Shop', href: '/', match: 'exact' },
  { label: 'Roasts', href: '/roasts', match: 'prefix' },
  { label: 'Brew Guides', href: '/brew-guides', match: 'prefix' },
  { label: 'Subscriptions', href: '/subscriptions', match: 'prefix' },
  { label: 'Contact', href: '/contact', match: 'prefix' },
]

export const DASHBOARD_MENU = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    match: 'exact',
  },
  {
    label: 'Products',
    href: '/dashboard/products',
    icon: Coffee,
    match: 'prefix',
  },
  {
    label: 'Favorites',
    href: '/dashboard/favorites',
    icon: Heart,
    match: 'prefix',
  },
  {
    label: 'Orders',
    href: '/dashboard/orders',
    icon: FileText,
    match: 'prefix',
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    match: 'prefix',
  },
]
