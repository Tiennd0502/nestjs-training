import { Suspense } from 'react'

import { PageContent } from './PageContent'

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <div className="px-6 py-12 text-center text-muted-foreground">
          Loading…
        </div>
      }
    >
      <PageContent />
    </Suspense>
  )
}
