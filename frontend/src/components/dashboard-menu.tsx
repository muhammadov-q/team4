'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Code, History, PanelLeftClose, PanelLeftOpen, ScanLine } from 'lucide-react'
import { useState } from 'react'
import { SignedInAs } from '@/components/auth/signed-in-as'
import { ThemeToggle } from '@/components/theme-toggle'

const REPO_URL = 'https://github.com/muhammadov-q/team4'

const PAGES = [
  { href: '/dashboard', label: 'Read', icon: ScanLine, exact: true },
  { href: '/dashboard/history', label: 'History', icon: History, exact: false },
] as const

export function DashboardMenu() {
  const [expanded, setExpanded] = useState(true)
  const pathname = usePathname()

  const linkClass = 'flex min-h-12 items-center gap-3 rounded-xl px-3 hover:bg-muted'

  return (
    <aside
      aria-label="Dashboard sidebar"
      className={`sticky top-0 flex h-svh shrink-0 flex-col gap-6 bg-card p-3 ${
        expanded ? 'w-64 max-w-[70vw]' : 'w-20'
      }`}
    >
      <div className="flex min-h-12 items-center gap-3">
        <button
          type="button"
          aria-label={expanded ? 'Collapse navigation' : 'Expand navigation'}
          aria-expanded={expanded}
          aria-controls="dashboard-navigation"
          onClick={() => setExpanded((value) => !value)}
          className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {expanded ? <PanelLeftClose aria-hidden="true" /> : <PanelLeftOpen aria-hidden="true" />}
        </button>

        {expanded && (
          <Link
            href="/dashboard"
            className="rounded-lg text-xl font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Team4
          </Link>
        )}
      </div>

      {expanded && (
        <div className="min-w-0 overflow-hidden">
          <SignedInAs />
        </div>
      )}

      <nav
        id="dashboard-navigation"
        aria-label="Dashboard navigation"
        className="flex flex-col gap-2"
      >
        {PAGES.map(({ href, label, icon: Icon, exact }) => {
          const current = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={current ? 'page' : undefined}
              aria-label={label}
              title={expanded ? undefined : label}
              className={
                current
                  ? `${linkClass} bg-primary font-medium text-primary-foreground hover:bg-primary/90`
                  : linkClass
              }
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              {expanded && <span>{label}</span>}
            </Link>
          )
        })}

        <a
          href={`${REPO_URL}/tree/develop/docs`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Docs (opens in a new tab)"
          title={expanded ? undefined : 'Docs'}
          className={linkClass}
        >
          <BookOpen className="size-5 shrink-0" aria-hidden="true" />
          {expanded && <span>Docs</span>}
        </a>

        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Source (opens in a new tab)"
          title={expanded ? undefined : 'Source'}
          className={linkClass}
        >
          <Code className="size-5 shrink-0" aria-hidden="true" />
          {expanded && <span>Source</span>}
        </a>
      </nav>

      <div className="mt-auto flex items-center justify-between gap-2">
        {expanded && <span className="pl-3 text-sm">Theme</span>}
        <ThemeToggle />
      </div>
    </aside>
  )
}
