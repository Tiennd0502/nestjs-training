'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, Printer, UserPlus } from 'lucide-react'

// Constants
import { ROUTES } from '@/constants/routes'
import { SEARCH_URL_DEBOUNCE_MS } from '@/constants/common'
import {
  ROLE_FILTER_OPTIONS,
  USERS_DASHBOARD_STATS,
  USERS_TABLE_COLUMNS,
} from '@/constants/user'

// Hooks
import { useUsers } from '@/hooks/useUser'
import { useUrlState } from '@/hooks/useUrlState'

// Components
import Breadcrumb from '@/components/Breadcrumb'
import Table from '@/components/Table'
import { PaginationBar } from '@/components/Pagination'
import { Select } from '@/components/Select'
import { SearchInput } from '@/components/SearchInput'
import StatsCards from '@/components/StatsCards'
import { Button } from '@/components/ui/button'
import { UserTableRow } from '@/sections/UserTableRow'

// Utils
import { userUrlSchema } from '@/utils/user'

export const PageContent = () => {
  const { state, update: updateUrl } = useUrlState(userUrlSchema)
  const { page, search, role, limit } = state
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searchInput, setSearchInput] = useState(search)
  const updateUrlRef = useRef(updateUrl)
  const urlSearchRef = useRef(search)
  const lastUrlSearchSynced = useRef<string | null>(null)
  updateUrlRef.current = updateUrl
  urlSearchRef.current = search

  useEffect(() => {
    if (lastUrlSearchSynced.current === null) {
      lastUrlSearchSynced.current = search
      return
    }
    if (search === lastUrlSearchSynced.current) return
    lastUrlSearchSynced.current = search
    if (searchInputRef.current === document.activeElement) return
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (searchInput === urlSearchRef.current) return
      updateUrlRef.current({ search: searchInput, page: 1 })
    }, SEARCH_URL_DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [searchInput])

  const { users, meta, isLoading, isError, errorMessage, refetch } = useUsers({
    page,
    limit,
    search: search.trim(),
    role: role ?? undefined,
  })

  const totalPages = Math.max(1, meta?.pageCount ?? 1)
  const totalCount = meta?.totalCount ?? users.length
  const showingCount = users.length

  useEffect(() => {
    if (page > totalPages) {
      updateUrl({ page: totalPages })
    }
  }, [page, totalPages, updateUrl])

  const handleRoleChange = (value: unknown) => {
    if (typeof value !== 'string' || !ROLE_FILTER_OPTIONS.includes(value)) {
      return
    }
    updateUrl({
      role: value === ROLE_FILTER_OPTIONS[0] ? null : value,
      page: 1,
    })
  }

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value)
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-3">
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: ROUTES.DASHBOARD },
              { label: 'Users', href: ROUTES.DASHBOARD_USERS },
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
      </header>

      <StatsCards items={USERS_DASHBOARD_STATS} />

      <section className="overflow-hidden rounded-3xl border border-outline-variant/40 bg-card">
        <div className="flex flex-col gap-3 border-b border-outline-variant/30 p-4 md:flex-row lg:items-center lg:justify-between">
          <SearchInput
            ref={searchInputRef}
            value={searchInput}
            onChange={handleQueryChange}
            placeholder="Filter by name or email..."
            aria-label="Filter users by name or email"
            containerClassName="h-12 bg-surface-container-high w-full md:max-w-md"
          />
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="min-w-40">
              <Select
                classNameTrigger="rounded-full capitalize"
                value={role ?? ROLE_FILTER_OPTIONS[0]}
                onValueChange={handleRoleChange}
                options={[...ROLE_FILTER_OPTIONS]}
                placeholder="All Roles"
              />
            </div>
            <Button
              disabled
              variant="outline"
              size="icon"
              aria-label="Export users list"
              className="size-11"
            >
              <Download className="size-4" aria-hidden />
            </Button>
            <Button
              disabled
              variant="outline"
              size="icon"
              aria-label="Print users list"
              className="size-11"
            >
              <Printer className="size-4" aria-hidden />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="px-6 py-12 text-center text-muted-foreground">
            Loading users...
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <p className="text-muted-foreground">{errorMessage}</p>
            <Button
              className="w-fit px-6"
              variant="destructive"
              size="sm"
              onClick={() => void refetch()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <Table
            columns={USERS_TABLE_COLUMNS}
            data={users}
            getRowKey={(user, index) => user.id ?? `user-${index}`}
            renderRow={(user) => <UserTableRow user={user} />}
          />
        )}

        <footer className="border-t border-outline-variant/30 px-6 py-4">
          <PaginationBar
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(next) => updateUrl({ page: next })}
            showingCount={showingCount}
            totalCount={totalCount}
          />
        </footer>
      </section>
    </div>
  )
}
