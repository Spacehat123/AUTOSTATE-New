import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Playfair_Display } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { SpeedInsights } from "@vercel/speed-insights/next"
import '@/lib/env'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: 'Autostate — AI Collection Manager',
  description: 'AI-powered accounts receivable management',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`dark h-full antialiased ${playfair.variable}`}>
        <body className="min-h-full flex flex-col">
          {children}
          <Toaster />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  )
}
