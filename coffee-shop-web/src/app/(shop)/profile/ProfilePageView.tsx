'use client'

import { ChevronRight, Coffee, Filter, Pencil } from 'lucide-react'
import { useUser as useClerkUser } from '@clerk/nextjs'

import type { ClerkUser } from '@/types/user'
import { ORDERS } from '@/constants/order'
import { useAuth } from '@/hooks/useAuth'

import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/Avatar'
import { ProfileAccountDialogs } from './ProfileAccountDialogs'
import { cn } from '@/utils/styles'
import { resolveProfilePresentation } from '@/utils/api'
import { ORDER_STATUS } from '@/types/order'
import { DEFAULT_AVATAR } from '@/constants/images'

interface StatusPillProps {
  status: ORDER_STATUS
}

const StatusPill = ({ status }: StatusPillProps) => {
  if (status === ORDER_STATUS.CANCELLED) {
    return (
      <span
        className={cn(
          'inline-flex rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold text-on-surface-variant',
        )}
      >
        Cancelled
      </span>
    )
  }
  return (
    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-950/40 dark:text-green-300">
      Delivered
    </span>
  )
}

export function ProfilePageView() {
  const { user: apiUser, error, isSignedIn, isAuthLoaded } = useAuth()
  const { user: clerkUser, isLoaded: clerkLoaded } = useClerkUser()

  const { displayName, email, imageSrc } = resolveProfilePresentation(
    apiUser,
    (clerkLoaded ? clerkUser : apiUser) as ClerkUser,
    DEFAULT_AVATAR,
  )

  return (
    <div className="bg-background text-on-background">
      <div className="mx-auto max-w-7xl px-8 pb-24 pt-16 md:pt-20">
        <section className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="flex flex-col items-center gap-12 rounded-xl bg-surface-container-low p-8 md:flex-row md:items-start md:p-12 lg:col-span-8">
            <div className="relative shrink-0">
              <Avatar
                name={displayName}
                src={imageSrc}
                alt={displayName}
                isProfile
              />
              <Button
                type="button"
                size="icon"
                variant="default"
                className="absolute -bottom-4 -right-4 size-12 rounded-full bg-primary text-on-primary shadow-lg hover:scale-105"
                aria-label="Edit profile photo"
              >
                <Pencil className="size-5" aria-hidden />
              </Button>
            </div>

            <div className="min-w-0 flex-1 text-center md:text-left">
              <div className="mb-2 flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">
                <h1 className="font-headline text-4xl text-on-surface md:text-5xl">
                  {displayName}
                </h1>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto w-auto gap-2 p-0 font-semibold text-primary hover:opacity-70"
                >
                  <Pencil className="size-4 shrink-0" aria-hidden />
                  Edit Profile
                </Button>
              </div>
              <p className="mb-2 text-lg text-on-surface-variant">
                {email.length > 0 ? email : '—'}
              </p>
              {isAuthLoaded && !isSignedIn ? (
                <p className="mb-2 text-sm text-on-surface-variant">
                  Sign in to load your account from the API.
                </p>
              ) : null}
              {error && isSignedIn ? (
                <p className="mb-2 text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="mt-8">
                <ProfileAccountDialogs />
              </div>
            </div>
          </div>

          <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-linear-to-br from-primary to-primary-container p-10 text-on-primary lg:col-span-4">
            <div className="relative z-10">
              <p className="mb-2 font-sans text-xs font-medium uppercase tracking-widest opacity-80">
                The Sensory Member
              </p>
              <h2 className="font-headline text-3xl leading-tight text-on-primary">
                Expert <br />
                Brew Enthusiast
              </h2>
            </div>
            <div className="relative z-10 mt-8">
              <div className="mb-2 flex items-end justify-between">
                <span className="text-sm opacity-90">Beans Roasted</span>
                <span className="text-2xl font-bold">128kg</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-3/4 rounded-full bg-white" />
              </div>
            </div>
            <Coffee
              className="pointer-events-none absolute -bottom-10 -right-10 size-36 opacity-10 md:size-48"
              strokeWidth={1}
              aria-hidden
            />
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-headline text-3xl text-on-surface">
              Order History
            </h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-auto gap-2 rounded-full border-0 bg-surface-container-low px-4 py-2 font-sans text-sm font-normal text-on-surface-variant hover:bg-surface-container-low/80"
            >
              <Filter className="size-4" aria-hidden />
              Filter
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl bg-surface-container-lowest">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="px-8 py-6 font-sans text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Order ID
                    </th>
                    <th className="px-8 py-6 font-sans text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Date
                    </th>
                    <th className="px-8 py-6 font-sans text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Status
                    </th>
                    <th className="px-8 py-6 font-sans text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Total
                    </th>
                    <th className="px-8 py-6 text-right font-sans text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {ORDERS.map((order) => (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-surface-container-low/30"
                    >
                      <td className="px-8 py-8 font-medium text-on-surface">
                        {order.id}
                      </td>
                      <td className="px-8 py-8 text-on-surface-variant">
                        {order.date}
                      </td>
                      <td className="px-8 py-8">
                        <StatusPill status={order.status as ORDER_STATUS} />
                      </td>
                      <td className="px-8 py-8 font-bold text-on-surface">
                        {order.total}
                      </td>
                      <td className="px-8 py-8 text-right">
                        <Button
                          type="button"
                          variant="link"
                          className="ms-auto inline-flex h-auto w-auto gap-1 p-0 font-semibold text-primary"
                        >
                          View Details
                          <ChevronRight className="size-4" aria-hidden />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
