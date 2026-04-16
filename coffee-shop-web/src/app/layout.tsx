import type { Metadata } from 'next'
import { Noto_Serif, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const fontBody = Plus_Jakarta_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

const fontHeading = Noto_Serif({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: 'Node Brew',
  description: 'Node Brew — premium coffee experience',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontBody.variable} ${fontHeading.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
