'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Download,
  Mail,
  Pencil,
  Printer,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react'

import { Avatar } from '@/components/Avatar'
import Breadcrumb from '@/components/Breadcrumb'
import { PaginationBar } from '@/components/Pagination'
import { Select } from '@/components/Select'
import { SearchInput } from '@/components/SearchInput'
import StatsCards from '@/components/StatsCards'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/styles'
import { USER_ROLES, USER_STATUS } from '@/types/user'

interface DashboardUser {
  id: string
  name: string
  email: string
  avatarUrl: string
  role: USER_ROLES
  status: USER_STATUS
}

const ROLE_FILTER_OPTIONS = [
  'All Roles',
  ...Object.values(USER_ROLES).map((role) => role.toString()),
]
const PAGE_SIZE = 4

const DASHBOARD_USERS: DashboardUser[] = [
  {
    id: 'u-1',
    name: 'Julian Vance',
    email: 'julian.v@sensorybrew.com',
    avatarUrl: 'https://i.pravatar.cc/100?img=12',
    role: USER_ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
  },
  {
    id: 'u-2',
    name: 'Elena Rossi',
    email: 'e.rossi@sensorybrew.com',
    avatarUrl: 'https://i.pravatar.cc/100?img=32',
    role: USER_ROLES.USER,
    status: USER_STATUS.ACTIVE,
  },
  {
    id: 'u-3',
    name: 'Marcus Thorne',
    email: 'm.thorne@sensorybrew.com',
    avatarUrl: 'https://i.pravatar.cc/100?img=15',
    role: USER_ROLES.USER,
    status: USER_STATUS.INACTIVE,
  },
  {
    id: 'u-4',
    name: 'Sasha Bloom',
    email: 's.bloom@sensorybrew.com',
    avatarUrl: 'https://i.pravatar.cc/100?img=47',
    role: USER_ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
  },
  {
    id: 'u-5',
    name: 'Lena Carter',
    email: 'l.carter@sensorybrew.com',
    avatarUrl: 'https://i.pravatar.cc/100?img=6',
    role: USER_ROLES.USER,
    status: USER_STATUS.ACTIVE,
  },
  {
    id: 'u-6',
    name: 'Noah Grimes',
    email: 'n.grimes@sensorybrew.com',
    avatarUrl: 'https://i.pravatar.cc/100?img=9',
    role: USER_ROLES.ADMIN,
    status: USER_STATUS.INACTIVE,
  },
]

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [query, setQuery] = useState('')
  const [selectedRole, setSelectedRole] =
    useState<(typeof ROLE_FILTER_OPTIONS)[number]>('All Roles')

  const filteredUsers = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase()

    return DASHBOARD_USERS.filter((user) => {
      const matchesRole =
        selectedRole === 'All Roles' || user.role === selectedRole
      const matchesSearch =
        trimmedQuery.length === 0 ||
        user.name.toLowerCase().includes(trimmedQuery) ||
        user.email.toLowerCase().includes(trimmedQuery)

      return matchesRole && matchesSearch
    })
  }, [query, selectedRole])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredUsers.slice(start, start + PAGE_SIZE)
  }, [currentPage, filteredUsers])

  const showingCount = paginatedUsers.length
  const totalCount = filteredUsers.length

  const handleRoleChange = (value: unknown) => {
    if (typeof value !== 'string' || !ROLE_FILTER_OPTIONS.includes(value)) {
      return
    }

    setSelectedRole(value)
    setCurrentPage(1)
  }

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-3">
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: ROUTES.DASHBOARD },
              { label: 'Manage Users', href: ROUTES.DASHBOARD_USERS },
            ]}
          />
          <div className="space-y-2">
            <h1 className="text-5xl leading-tight font-bold tracking-tight text-foreground">
              Manage Users
            </h1>
            <p className="text-lg text-muted-foreground">
              Oversee your brewing staff and editorial curators.
            </p>
          </div>
        </div>
        <div className="flex w-full justify-end sm:w-auto">
          <Button
            variant="default"
            size="default"
            disabled
            className="w-full gap-2 px-8 sm:w-auto"
          >
            <UserPlus className="size-4" aria-hidden />
            Invite User
          </Button>
        </div>
      </div>
      <StatsCards
        items={[
          {
            id: 'total-users',
            label: 'Total users',
            value: '1,284',
            footnote: '+12% this month',
            footnoteTone: 'success',
            footnoteIcon: UserPlus,
          },
          {
            id: 'active-baristas',
            label: 'Active baristas',
            value: 42,
            footnote: 'Across 8 lab locations',
            footnoteIcon: Users,
          },
          {
            id: 'Admins',
            label: 'Admins',
            value: 12,
            footnote: '2 recently promoted',
            footnoteIcon: UserCheck,
          },
          {
            id: 'pending-invites',
            label: 'Pending invites',
            value: '07',
            footnote: 'Requires approval',
            variant: 'accent',
            icon: UserPlus,
            footnoteIcon: Mail,
          },
        ]}
      />

      <section className="overflow-hidden rounded-3xl border border-outline-variant/40 bg-card">
        <div className="flex flex-col gap-3 border-b border-outline-variant/30 p-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            value={query}
            onChange={handleQueryChange}
            placeholder="Filter by name or email..."
            aria-label="Filter users by name or email"
            containerClassName="h-12 bg-surface-container-high lg:max-w-md"
          />
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="min-w-40">
              <Select
                classNameTrigger="rounded-full"
                value={selectedRole}
                onValueChange={handleRoleChange}
                options={[...ROLE_FILTER_OPTIONS]}
                placeholder="All Roles"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              aria-label="Export users list"
              className="size-11"
            >
              <Download className="size-4" aria-hidden />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Print users list"
              className="size-11"
            >
              <Printer className="size-4" aria-hidden />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-surface-container text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => {
                  const isActive = user.status === USER_STATUS.ACTIVE
                  const isAdmin = user.role === USER_ROLES.ADMIN.toString()

                  return (
                    <tr
                      key={user.id}
                      className="border-t border-outline-variant/25"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={user.name}
                            src={user.avatarUrl}
                            alt={user.name}
                          />
                          <div className="space-y-0.5">
                            <p className="font-semibold text-foreground">
                              {user.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
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
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-2 text-sm font-medium',
                            isActive
                              ? 'text-foreground'
                              : 'text-muted-foreground',
                          )}
                        >
                          <span
                            className={cn(
                              'size-2 rounded-full',
                              isActive
                                ? 'bg-emerald-500'
                                : 'bg-muted-foreground/40',
                            )}
                            aria-hidden
                          />
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            aria-label={`Edit ${user.name}`}
                          >
                            <Pencil className="size-4" aria-hidden />
                          </Button>
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            aria-label={`Delete ${user.name}`}
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No users match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-outline-variant/30 px-6 py-4">
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showingCount={showingCount}
            totalCount={totalCount}
          />
        </div>
      </section>
    </div>
  )
}
