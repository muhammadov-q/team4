'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { SignedInAs } from '@/components/auth/signed-in-as'
import { ThemeToggle } from '@/components/theme-toggle'

const REPO_URL = 'https://github.com/muhammadov-q/team4'

export function DashboardMenu() {
  const [hovered, setHovered] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const open = !dismissed && (hovered || pinned)

  function close() {
    setPinned(false)
    setHovered(false)
    setDismissed(true)
  }

  return (
    <div
      className="fixed top-0 left-0 z-50"
      onMouseEnter={() => {
        setDismissed(false)
        setHovered(true)
      }}
      onMouseLeave={() => {
        setHovered(false)
        setDismissed(false)
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          close()
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          close()
          event.currentTarget.querySelector('button')?.focus()
        }
      }}
    >
      <div className="relative z-10 flex items-center gap-3 p-4">
        <button
          type="button"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          aria-controls="dashboard-navigation"
          onClick={() => {
            if (pinned) {
              close()
            } else {
              setDismissed(false)
              setPinned(true)
            }
          }}
          className="flex size-12 items-center justify-center rounded-xl border border-border bg-background shadow-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>

        <Link
          href="/dashboard"
          className="rounded-lg text-2xl font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Team4
        </Link>
      </div>

      {open && (
        <aside
          id="dashboard-navigation"
          aria-label="Dashboard sidebar"
          className="flex h-[calc(100svh-5rem)] w-64 max-w-[calc(100vw-2rem)] flex-col gap-8 overflow-y-auto border-r border-border bg-background px-6 py-6 shadow-xl"
        >
          <SignedInAs />

          <nav aria-label="Dashboard navigation" className="flex flex-col gap-2">
            <Link
              href="/dashboard"
              aria-current="page"
              onClick={close}
              className="rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground"
            >
              Read
            </Link>

            <a
              href={`${REPO_URL}/tree/develop/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl px-4 py-3 hover:bg-muted"
            >
              Docs
              <span className="sr-only"> (opens in a new tab)</span>
            </a>

            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl px-4 py-3 hover:bg-muted"
            >
              Source
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </nav>

          <div className="mt-auto flex items-center justify-between">
            <span className="text-sm">Theme</span>
            <ThemeToggle />
          </div>
        </aside>
      )}
    </div>
  )
}
