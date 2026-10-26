'use client'

import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useSignOut } from '@/hooks/use-auth'

export function SignOutButton() {
  const signOut = useSignOut()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Sign out"
      title="Sign out"
      disabled={signOut.isPending}
      onClick={() => signOut.mutate(undefined, { onError: (error) => toast.error(error.message) })}
    >
      <LogOut />
    </Button>
  )
}
