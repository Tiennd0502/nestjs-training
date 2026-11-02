import type { ReactNode } from 'react'

import Breadcrumb, { type BreadcrumbNavItem } from '@/components/Breadcrumb'

export interface PageHeaderProps {
  breadcrumbItems: BreadcrumbNavItem[]
  title: ReactNode
  description?: ReactNode
  /** One element or a fragment of elements, never inside a wrapper element: PageHeader sizes and places its direct children. */
  actions?: ReactNode
}

const PageHeader = ({
  breadcrumbItems,
  title,
  description,
  actions,
}: PageHeaderProps) => (
  <header className="flex flex-col gap-3">
    <Breadcrumb items={breadcrumbItems} />
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-2">
        <h1 className="font-headline text-4xl leading-tight font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:ml-auto sm:w-auto *:w-full sm:*:w-auto">
          {actions}
        </div>
      )}
    </div>
  </header>
)

export default PageHeader
