import Link from 'next/link'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

const REPO_URL = 'https://github.com/muhammadov-q/team4'
const DOCS_URL = `${REPO_URL}/tree/develop/docs`

function ExternalLink({ children, ...props }: React.ComponentProps<'a'>) {
  return (
    <a target="_blank" rel="noopener noreferrer" {...props}>
      {children} <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-4 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-[1200px] items-center justify-between gap-4 sm:top-6">
      <Link
        href="/"
        className="rounded-lg text-xl font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Team4
      </Link>
      <nav className="flex items-center gap-1 rounded-xl bg-muted/90 px-2 py-1.5 backdrop-blur">
        <Button asChild variant="ghost" size="sm" className="hidden text-foreground sm:inline-flex">
          <ExternalLink href={DOCS_URL}>Docs</ExternalLink>
        </Button>
        <Button asChild variant="ghost" size="sm" className="hidden text-foreground sm:inline-flex">
          <ExternalLink href={REPO_URL}>Source</ExternalLink>
        </Button>
        <ThemeToggle />
      </nav>
      <SignOutButton />
    </header>
  )
}
