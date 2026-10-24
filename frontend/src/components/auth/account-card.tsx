'use client'

import { cn } from 'cn'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/hooks/use-auth'
import type { User } from '@/lib/api/auth'

function initials(user: User) {
  const letters = [user.first_name, user.last_name].map((part) => part?.[0] ?? '').join('')
  return letters || user.email[0]
}

export function AccountCard({ expanded }: { expanded: boolean }) {
  const { data: user, isPending } = useCurrentUser()

  if (isPending) {
    return <Skeleton className={cn('h-21 w-12 rounded-2xl', expanded && 'lg:h-12.5 lg:w-full')} />
  }
  if (!user) return <SignOutButton />

  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1 rounded-2xl bg-muted p-1.5',
        expanded && 'lg:flex-row lg:gap-3 lg:pl-2.5'
      )}
    >
      <span
        aria-hidden="true"
        title={name}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card font-mono text-xs font-medium uppercase dark:bg-background"
      >
        {initials(user)}
      </span>
      <div className={cn('min-w-0 flex-1', expanded ? 'sr-only lg:not-sr-only' : 'sr-only')}>
        <p className="truncate text-sm font-medium">
          <span className="sr-only">Signed in as </span>
          {name}
        </p>
        {name !== user.email && (
          <p className="truncate font-mono text-caption text-muted-foreground">{user.email}</p>
        )}
      </div>
      <SignOutButton />
    </div>
  )
}
