'use client'

import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/nextjs'

// Components
import { SearchInput } from '@/components/SearchInput'
import { ThemeToggle } from '@/components/ThemeToggle'
import { UserDropdown } from '@/components/UserDropdown'

// Utils
import { cn } from '@/utils/styles'
import { ROUTES } from '@/constants/routes'
import { SidebarTrigger } from '@/components/ui/sidebar'

export interface HeaderDashboardProps {
  className?: string
}

const HeaderDashboard = ({ className }: HeaderDashboardProps) => {
  return (
    <header
      className={cn(
        'flex-1 max-h-fit items-center bg-background justify-center gap-3 rounded-none border-b px-5 py-6 shadow-xl shadow-on-surface/5 my-auto sticky top-0 z-40',
        className,
      )}
    >
      <div className="flex justify-between items-center gap-6 sm:gap-2 md:gap-3">
        <div className="flex items-center gap-6">
          <SidebarTrigger className="size-6 inline-block" />
          <SearchInput
            aria-label="Search products"
            containerClassName="h-9 min-w-[250px] w-auto"
          />
        </div>
        <div className="flex items-end justify-end gap-10">
          <ThemeToggle className="h-8 w-8" />
          <SignedIn>
            <div className="shrink-0">
              <UserDropdown forceDropdown showChevron={false} isDashboard />
            </div>
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn redirectUrl={ROUTES.SIGN_IN} />
          </SignedOut>
        </div>
      </div>
    </header>
  )
}

export default HeaderDashboard
