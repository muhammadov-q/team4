'use client'

import { Chip } from '@/components/ui/chip'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/hooks/use-auth'

export function SignedInAs() {
  const { data: user, isPending } = useCurrentUser()

  if (isPending) return <Skeleton className="h-6 w-48" />
  if (!user) return null

  const name = [user.first_name, user.last_name].filter(Boolean).join(' ')

  return (
    <Chip>
      Signed in as <span className="text-foreground">{name || user.email}</span>
    </Chip>
  )
}
