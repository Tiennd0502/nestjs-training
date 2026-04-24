import type { Metadata } from 'next'
import { Suspense } from 'react'

import { Spinner } from '@/components/ui/spinner'
import RoastsPageContent from '@/sections/RoastsPageContent'

export const metadata: Metadata = {
  title: 'Node Brew | Roast Collections',
  description:
    'Explore curated roast profiles with flexible filters for price, roast level, and collection style.',
}

export default function RoastsPage() {
  return (
    <Suspense
      fallback={
        <div className="px-6 py-12 text-center text-muted-foreground">
          <Spinner size="lg" label="Loading roasts" className="text-primary" />
        </div>
      }
    >
      <RoastsPageContent />
    </Suspense>
  )
}
