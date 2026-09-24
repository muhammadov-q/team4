import type { Metadata } from 'next'
import { EB_Garamond, Figtree, Geist_Mono } from 'next/font/google'
import { Providers } from '@/components/providers'
import { SiteHeader } from '@/components/site-header'
import './globals.css'

const figtree = Figtree({ variable: '--font-figtree', subsets: ['latin'] })
// Display face for the wordmark and page titles only.
const garamond = EB_Garamond({ variable: '--font-eb-garamond', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'Codex Lens', template: '%s · Codex Lens' },
  description: 'Recognize, analyze and understand historical manuscripts.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${figtree.variable} ${garamond.variable} ${geistMono.variable}`}
    >
      <body className="flex min-h-svh flex-col antialiased">
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  )
}
