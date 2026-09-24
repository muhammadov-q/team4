import Link from 'next/link'
import { LogoMark } from '@/components/brand/logo-mark'
import { ThemeToggle } from '@/components/theme-toggle'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="-mx-1 flex items-center gap-2.5 rounded-md px-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <LogoMark className="size-7" />
          <span className="font-display text-xl font-medium tracking-tight">Codex Lens</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
