'use client'

import { CircleAlertIcon, RotateCcwIcon, ScanTextIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingOrb } from '@/components/ui/loading-orb'
import { Skeleton } from '@/components/ui/skeleton'
import { useElapsed } from '@/hooks/use-elapsed'
import type { usePredict } from '@/hooks/use-predict'
import { formatDuration } from '@/lib/format'
import { describeRecognitionError } from './describe-error'
import { RecognitionResult } from './recognition-result'

interface RecognitionPanelProps {
  hasPage: boolean
  run: ReturnType<typeof usePredict>
  onRecognize: () => void
  onCancel: () => void
}

export function RecognitionPanel({ hasPage, run, onRecognize, onCancel }: RecognitionPanelProps) {
  return (
    <Card className="lg:sticky lg:top-20">
      <CardHeader>
        <CardTitle>Recognition</CardTitle>
        <CardDescription>The model reads the page and returns its result.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Button
          size="lg"
          className="w-full"
          disabled={!hasPage || run.isPending}
          onClick={onRecognize}
        >
          {run.isError ? <RotateCcwIcon /> : <ScanTextIcon />}
          {run.isPending ? 'Recognizing…' : run.isError ? 'Try again' : 'Recognize page'}
        </Button>

        {run.isIdle && <IdleState hasPage={hasPage} />}
        {run.isPending && <PendingState submittedAt={run.submittedAt} onCancel={onCancel} />}
        {run.isError && <ErrorState error={run.error} />}
        {run.isSuccess && <RecognitionResult result={run.data} />}
      </CardContent>
    </Card>
  )
}

function IdleState({ hasPage }: { hasPage: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <LoadingOrb state="searching" size={64} paused />
      <div className="space-y-1">
        <p className="text-sm font-medium">{hasPage ? 'Ready to read' : 'No page yet'}</p>
        <p className="mx-auto max-w-60 text-sm text-muted-foreground">
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
    <div className="space-y-5" aria-live="polite">
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <LoadingOrb state="searching" size={64} />
        <div className="space-y-1">
          <p className="text-sm font-medium">Reading the page</p>
          <p className="text-sm text-muted-foreground tabular-nums">
            {formatDuration(elapsed)} elapsed
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
      {/* Mirrors RecognitionResult so the swap to the real response doesn't shift the card. */}
      <div aria-hidden className="space-y-4">
        <Skeleton className="h-4 w-44" />
        <div className="divide-y rounded-lg border">
          {['w-20', 'w-16'].map((width) => (
            <div key={width} className="flex items-center justify-between px-3 py-3">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className={`h-3.5 ${width}`} />
            </div>
          ))}
        </div>
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  )
}

function ErrorState({ error }: { error: unknown }) {
  const { title, message } = describeRecognitionError(error)

  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
