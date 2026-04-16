export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
