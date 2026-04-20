'use client'

import { Pencil, Trash2 } from 'lucide-react'

// Types
import type { User } from '@/types/user'
import { USER_ROLES, USER_STATUS } from '@/types/user'

// Components
import { Avatar } from '@/components/Avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Utils
import { getNameInitials } from '@/utils/common'
import { cn } from '@/utils/styles'

export function UserTableRow({ user }: { user: User }) {
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
  const initials = getNameInitials(user.firstName, user.lastName)
  const email = user.email ?? ''
  const imageUrl = user.imageUrl ?? ''
  const rowRole = user.role ?? USER_ROLES.USER
  const status = user.status ?? USER_STATUS.INACTIVE
  const isActive = status === USER_STATUS.ACTIVE
  const isAdmin = rowRole === USER_ROLES.ADMIN

  return (
    <>
      <td className="min-w-0 px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar size="lg" name={initials} src={imageUrl} alt={name} />
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="truncate font-semibold text-foreground">{name}</p>
            <p className="truncate text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge
          className={cn(
            'h-7 px-3 text-[0.65rem] tracking-[0.16em] uppercase',
            isAdmin
              ? 'bg-foreground text-background'
              : 'bg-primary/20 text-primary',
          )}
        >
          {rowRole}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <span
          className={cn(
            'inline-flex items-center gap-2 text-sm font-medium',
            isActive ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          <span
            className={cn(
              'size-2 rounded-full',
              isActive ? 'bg-emerald-500' : 'bg-muted-foreground/40',
            )}
            aria-hidden
          />
          {status}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-end gap-1">
          <Button size="icon-xs" variant="ghost" aria-label={`Edit ${name}`}>
            <Pencil className="size-4" aria-hidden />
          </Button>
          <Button size="icon-xs" variant="ghost" aria-label={`Delete ${name}`}>
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      </td>
    </>
  )
}
