'use client'

import Link from 'next/link'
import { ErrorNotice } from '@/components/error-notice'
import { Annotation } from '@/components/ui/annotation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Chip } from '@/components/ui/chip'
import { Skeleton } from '@/components/ui/skeleton'
import { useRecognitions } from '@/hooks/use-recognitions'
import { readDigits } from '@/lib/digits'
import { formatDateTime } from '@/lib/format'
import { ApiError } from '@/lib/api/client'

export function HistoryList() {
  const history = useRecognitions()

  if (history.isPending) return <HistorySkeleton />

  if (history.error instanceof ApiError && history.error.status === 401) {
    return (
      <Card className="space-y-4">
        <p className="font-medium">Sign in to view your history</p>
        <p className="text-muted-foreground">
          You can recognize images as a guest. Sign in to save future results and view your saved
          history.
        </p>
        <Button asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </Card>
    )
  }

  if (history.isError) {
    return (
      <Card>
        <ErrorNotice title="Could not load your history" message={history.error.message} />
      </Card>
    )
  }

  if (history.data.length === 0) {
    return (
      <Card className="space-y-4">
        <p className="font-medium">No results yet</p>
        <p className="text-muted-foreground">Read a page and its result is saved here.</p>
        <Button asChild>
          <Link href="/dashboard">Read a page</Link>
        </Button>
      </Card>
    )
  }

  const count = history.data.length

  return (
    <Card className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-medium">
          {count} {count === 1 ? 'result' : 'results'}
        </p>
        <Chip>Machine output</Chip>
      </div>

      <ul aria-label="Past results" className="space-y-2">
        {history.data.map((recognition) => (
          <li key={recognition.id}>
            <Link
              href={`/dashboard/history/${recognition.id}`}
              className="flex items-center justify-between gap-4 rounded-xl bg-muted px-4 py-3 outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="min-w-0 space-y-0.5">
                <span className="block truncate font-medium">
                  {recognition.filename || 'Untitled page'}
                </span>
                <Annotation className="block">{formatDateTime(recognition.created_at)}</Annotation>
              </span>
              <span className="max-w-[50%] shrink-0 truncate text-lg font-medium tabular-nums">
                {readDigits(recognition.predictions) || 'No digits'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function HistorySkeleton() {
  return (
    <Card aria-hidden className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-28" />
      </div>
      <div className="space-y-2">
        {['w-40', 'w-32', 'w-48'].map((width) => (
          <div
            key={width}
            className="flex items-center justify-between rounded-xl bg-muted px-4 py-3"
          >
            <div className="space-y-2">
              <Skeleton className={`h-4 ${width}`} />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </Card>
  )
}
