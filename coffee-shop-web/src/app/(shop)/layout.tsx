import { ThemeToggle } from '@/components/ThemeToggle'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-end border-b border-border px-6 py-3">
        <ThemeToggle />
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
