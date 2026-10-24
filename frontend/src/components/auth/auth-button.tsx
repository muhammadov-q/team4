'use client'

import Link from 'next/link'
import { useCurrentUser } from '@/hooks/use-auth'
import { SignOutButton } from './sign-out-button'

export function AuthButton() {
  const { data: user, isPending, isError } = useCurrentUser()

  if (isPending) {
    return (
      <span role="status" className="text-sm text-muted-foreground">
        Loading account…
      </span>
    )
  }

  if (isError) {
    return (
      <span role="status" className="text-sm text-muted-foreground">
        Account unavailable
      </span>
    )
  }

  if (user) {
    return <SignOutButton />
  }

  return (
    <Link
      href="/sign-in"
      className="inline-flex min-h-9 items-center justify-center rounded-xl bg-muted/90 px-4 py-2 text-sm font-medium text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
    >
      Sign in
    </Link>
  )
}
