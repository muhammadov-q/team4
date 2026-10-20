'use client'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useSignOut } from '@/hooks/use-auth'

export function SignOutButton() {
  const signOut = useSignOut()

  return (
    <Button
      variant="ghost"
      className="rounded-xl bg-muted/90 text-foreground backdrop-blur"
      disabled={signOut.isPending}
      onClick={() => signOut.mutate(undefined, { onError: (error) => toast.error(error.message) })}
    >
      Sign out
    </Button>
  )
}
