'use client'

import { Pencil, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Category } from '@/types/category'
import { cn } from '@/utils/styles'

function formatTs(value: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export interface CategoryTableRowProps {
  category: Category
  onRequestDelete?: (category: Category) => void
}

export function CategoryTableRow({
  category,
  onRequestDelete,
}: CategoryTableRowProps) {
  const isDeleted = Boolean(category.deletedAt)

  return (
    <>
      <td className="min-w-0 px-6 py-4">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p
              className={cn(
                'truncate font-semibold text-foreground',
                isDeleted && 'text-muted-foreground line-through',
              )}
            >
              {category.name || '—'}
            </p>
            {isDeleted ? (
              <Badge
                variant="secondary"
                className="h-6 shrink-0 text-[0.6rem] uppercase tracking-wider"
              >
                Archived
              </Badge>
            ) : null}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <code className="rounded-md bg-muted px-4 py-2 text-sm truncate overflow-hidden text-ellipsis text-muted-foreground">
          {category.slug || '—'}
        </code>
      </td>
      <td className="px-6 py-4 text-sm text-muted-foreground">
        {formatTs(category.createdAt)}
      </td>
      <td className="px-6 py-4 text-sm text-muted-foreground">
        {formatTs(category.updatedAt)}
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-end gap-1">
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label={`Edit ${category.name}`}
            disabled={isDeleted}
          >
            <Pencil className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            aria-label={`Remove ${category.name}`}
            disabled={isDeleted || !category.id}
            onClick={() => {
              if (!category.id || isDeleted) return
              onRequestDelete?.(category)
            }}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      </td>
    </>
  )
}
