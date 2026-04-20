import {
  Sidebar as ContainerSidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import Sidebar from '@/components/Sidebar'
import HeaderDashboard from '@/layouts/Header/HeaderDashboard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider delay={0}>
      <SidebarProvider defaultOpen>
        <ContainerSidebar
          collapsible="icon"
          variant="inset"
          className="rounded-xl border-r border-sidebar-border shadow-xl shadow-on-surface/5"
        >
          <Sidebar />
        </ContainerSidebar>
        <SidebarInset className="bg-muted min-h-svh">
          <HeaderDashboard />
          <div className="flex-1 p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
