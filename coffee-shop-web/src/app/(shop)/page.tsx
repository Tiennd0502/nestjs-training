import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function ShopHomePage() {
  return (
    <div className="max-w-none space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Shop</h1>
      <p className="text-muted-foreground">
        Public storefront area. Use the navbar to open the dashboard.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({ variant: 'link' }),
            'h-auto min-h-0 px-0 py-0',
          )}
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
