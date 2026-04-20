'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { DASHBOARD_MENU } from '@/constants/nav'
import { cn } from '@/utils/styles'

import { Button } from '../ui/button'

const Sidebar = () => {
  const pathname = usePathname()

  return (
    <>
      <SidebarHeader className="gap-1 px-4 py-6">
        <p className="font-headline text-xl leading-tight text-sidebar-foreground">
          CoffeeHub Dashboard
        </p>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-dashboard-subtitle">
          The Editorial Chemist
        </p>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <nav aria-label="Dashboard" className="w-full min-w-0">
              <SidebarMenu className="gap-1">
                {DASHBOARD_MENU.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    item.match === 'exact'
                      ? pathname === item.href
                      : pathname === item.href ||
                        pathname.startsWith(`${item.href}/`)

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        render={
                          <Link
                            href={item.href}
                            aria-current={isActive ? 'page' : undefined}
                          />
                        }
                        tooltip={item.label}
                        className={cn(
                          'h-12 gap-3 rounded-full px-3 transition-colors',
                          'data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground data-active:hover:bg-sidebar-primary data-active:hover:text-sidebar-primary-foreground',
                          'text-sidebar-foreground/80 hover:text-sidebar-foreground',
                        )}
                        size="lg"
                      >
                        <Icon aria-hidden className="size-4 shrink-0" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <div className="rounded-xl bg-sidebar-accent/80 p-4 text-sidebar-foreground">
          <p className="font-semibold text-sidebar-foreground">
            Inventory Alert
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            3 items are running low on stock.
          </p>
          <Button
            disabled
            variant="default"
            className="mt-3 h-11 w-full rounded-lg border-0 bg-sidebar-primary text-sm font-medium text-sidebar-primary-foreground shadow-none hover:bg-sidebar-primary/90"
          >
            Manage Now
          </Button>
        </div>
      </SidebarFooter>
    </>
  )
}

export default Sidebar
