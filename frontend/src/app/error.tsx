'use client'

import { StatusPage } from '@/components/status-page'
import { Button } from '@/components/ui/button'

export default function RouteError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <StatusPage label="Error" title="Something went wrong">
      <p className="mt-4 text-muted-foreground">
        This page hit an unexpected error. Try again, and reload the page if it keeps happening.
      </p>
      <Button className="mt-8" onClick={reset}>
        Try again
      </Button>
    </StatusPage>
  )
}
