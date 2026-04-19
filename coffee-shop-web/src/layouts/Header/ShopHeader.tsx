'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import { Menu as MenuIcon, ShoppingCart, CircleUser } from 'lucide-react'

// Constants
import { MENU } from '@/constants/nav'
import { ROUTES } from '@/constants/routes'

// Types
import { type MenuItem } from '@/types/menu'

// Components
import { Menu } from '@/components/Menu'
import { SearchInput } from '@/components/SearchInput'
import { ThemeToggle } from '@/components/ThemeToggle'
import { UserDropdown } from '@/components/UserDropdown'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Utils
import { cn } from '@/utils/styles'

export interface ShopHeaderProps {
  className?: string
  menu?: MenuItem[]
}

const Header = ({ className, menu = MENU }: ShopHeaderProps) => {
  const router = useRouter()

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-border bg-background',
        className,
      )}
    >
      <div className="relative mx-auto flex h-14 max-w-7xl gap-10 items-center justify-between  px-4 md:h-16 md:px-6">
        <div className="flex ml-0 mr-auto min-w-0 flex-1 max-w-25 items-center">
          <Link
            href={ROUTES.HOME}
            className="shrink-0 text-lg font-bold tracking-tight text-foreground"
          >
            CoffeeHub
          </Link>
        </div>

        <Menu items={menu} />

        <div className="flex ml-auto mr-0 w-fit min-w-0 flex-1 items-center justify-end gap-6 sm:gap-2 md:gap-3">
          <div className="ml-auto mr-0 w-[256px] items-end justify-end lg:max-w-none lg:flex-none">
            <SearchInput
              aria-label="Search products"
              containerClassName="h-9 max-w-[250px] md:h-10"
            />
          </div>

          <ThemeToggle className="shrink-0 h-8 w-8" />

          <Link
            href={ROUTES.CART}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              'shrink-0 text-primary',
            )}
            aria-label="Shopping cart"
          >
            <ShoppingCart className="size-6" aria-hidden />
          </Link>

          <SignedOut>
            <Link
              href={ROUTES.SIGN_IN}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'shrink-0 text-primary',
              )}
              aria-label="Sign in"
            >
              <CircleUser className="size-6" aria-hidden />
            </Link>
          </SignedOut>

          <SignedIn>
            <div className="shrink-0">
              <UserDropdown forceDropdown showChevron={false} />
            </div>
          </SignedIn>

          <div className="shrink-0 lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger
                type="button"
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'text-primary',
                )}
                aria-label="Open navigation menu"
              >
                <MenuIcon className="size-5" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                {menu.map((item) => (
                  <DropdownMenuItem
                    key={item.href + item.label}
                    className="cursor-pointer"
                    onClick={() => router.push(item.href)}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
