import type { Metadata } from 'next'
import { Noto_Serif, Plus_Jakarta_Sans } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'

import { ROUTES } from '@/constants/routes'
import { ThemeProvider } from '@/theme/ThemeProvider'

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
  title: 'Shop',
  description: 'Public storefront and admin dashboard',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontBody.variable} ${fontHeading.variable} antialiased`}
      >
        <ClerkProvider signInUrl={ROUTES.SIGN_IN} signUpUrl={ROUTES.SIGN_UP}>
          <ThemeProvider>{children}</ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
