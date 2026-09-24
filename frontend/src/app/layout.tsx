import type { Metadata } from 'next'
import { JetBrains_Mono, Schibsted_Grotesk } from 'next/font/google'
import { Providers } from '@/components/providers'
import { SiteHeader } from '@/components/site-header'
import './globals.css'

const ui = Schibsted_Grotesk({ variable: '--font-ui', subsets: ['latin'] })
const jetbrainsMono = JetBrains_Mono({ variable: '--font-jetbrains-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'Team4', template: '%s · Team4' },
  description: 'Recognize, analyze and understand historical manuscripts.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${ui.variable} ${jetbrainsMono.variable}`}>
      <body className="flex min-h-svh flex-col antialiased">
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  )
}
