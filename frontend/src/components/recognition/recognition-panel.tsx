'use client'

import Link from 'next/link'
import { ErrorNotice } from '@/components/error-notice'
import { Annotation } from '@/components/ui/annotation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingOrb } from '@/components/ui/loading-orb'
import { Skeleton } from '@/components/ui/skeleton'
import { useElapsed } from '@/hooks/use-elapsed'
import type { useRecognize } from '@/hooks/use-recognitions'
import { formatDuration } from '@/lib/format'
import { describeRecognitionError } from './describe-error'
import { RecognitionResult } from './recognition-result'

interface RecognitionPanelProps {
  hasPage: boolean
  run: ReturnType<typeof useRecognize>
  onRecognize: () => void
  onCancel: () => void
}

export function RecognitionPanel({ hasPage, run, onRecognize, onCancel }: RecognitionPanelProps) {
  const label = run.isPending ? 'Recognizing…' : run.isError ? 'Try again' : 'Recognize page'

  return (
    <Card className="space-y-8 lg:sticky lg:top-28">
      <div className="space-y-2">
        <p className="font-mono text-sm text-muted-foreground">Recognition</p>
        <h2 className="text-2xl font-medium">Read the page</h2>
        <p className="text-muted-foreground">The model reads the page and returns its result.</p>
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={!hasPage || run.isPending}
        onClick={onRecognize}
      >
        {label}
      </Button>

      {run.isIdle && <IdleState hasPage={hasPage} />}
      {run.isPending && <PendingState submittedAt={run.submittedAt} onCancel={onCancel} />}
      {run.isError && <ErrorNotice {...describeRecognitionError(run.error)} />}
      {run.isSuccess && (
        <>
          <RecognitionResult recognition={run.data.recognition} durationMs={run.data.durationMs} />

          {run.data.savedId !== undefined ? (
            <p className="text-sm text-muted-foreground">
              Saved to your history.{' '}
              <Link
                href={`/dashboard/history/${run.data.savedId}`}
                className="font-medium text-foreground underline underline-offset-4"
              >
                Open it
              </Link>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              This result is not saved.{' '}
              <Link
                href="/sign-in"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Sign in
              </Link>{' '}
              to save future results to your history.
            </p>
          )}
        </>
      )}
    </Card>
  )
}

function IdleState({ hasPage }: { hasPage: boolean }) {
  return (
    <div className="flex items-center gap-5">
      <LoadingOrb state="searching" size={64} paused />
      <div className="space-y-1">
        <p className="font-medium">{hasPage ? 'Ready to read' : 'No page yet'}</p>
        <p className="text-sm text-muted-foreground">
          {hasPage
            ? 'Recognize the page to see what the model returns.'
            : 'Add a page image to get started.'}
        </p>
      </div>
    </div>
  )
}

function PendingState({ submittedAt, onCancel }: { submittedAt: number; onCancel: () => void }) {
  const elapsed = useElapsed(submittedAt)

  return (
    <div className="space-y-8" aria-live="polite">
      <div className="flex items-center gap-5">
        <LoadingOrb state="searching" size={64} />
        <div className="flex-1 space-y-1">
          <p className="font-medium">Reading the page</p>
          <Annotation>{formatDuration(elapsed)} elapsed</Annotation>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
      <div aria-hidden className="space-y-4">
        <Skeleton className="h-4 w-40" />
        <div className="space-y-2">
          {['w-28', 'w-16'].map((width) => (
            <div
              key={width}
              className="flex items-center justify-between rounded-xl bg-muted px-4 py-3"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className={`h-6 ${width}`} />
            </div>
          ))}
        </div>
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    </div>
  )
}
