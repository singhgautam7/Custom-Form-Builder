import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { QueryProvider } from '@/components/query-provider'
import { TooltipProvider } from '@/components/ui/tooltip'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Form Builder',
  description: 'Premium Custom Form Solution',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <TooltipProvider>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  className: 'border-border bg-card text-foreground',
                }}
              />
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
