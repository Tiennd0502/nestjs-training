import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted">
      <aside className="border-b border-border bg-card px-4 py-3">
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: 'link', size: 'sm' }),
            'h-auto min-h-0 px-0 py-0 text-sm',
          )}
        >
          Back to shop
        </Link>
      </aside>
      <div className="p-6">{children}</div>
    </div>
  )
}
