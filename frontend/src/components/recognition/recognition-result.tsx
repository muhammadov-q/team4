'use client'

import { CircleCheckIcon, CopyIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { PredictResult } from '@/hooks/use-predict'
import { formatDuration } from '@/lib/format'

const MOCK_MODEL_VERSION = 'mock'

export function RecognitionResult({ result }: { result: PredictResult }) {
  const { response, durationMs } = result
  const json = JSON.stringify(response, null, 2)
  const isMock = response.model_version === MOCK_MODEL_VERSION

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(json)
      toast.success('Response copied')
    } catch {
      toast.error('Could not copy the response')
    }
  }

  return (
    <section aria-label="Model response" className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <CircleCheckIcon className="size-4 text-success" />
        <span className="font-medium">Response received</span>
        <span className="text-muted-foreground tabular-nums">in {formatDuration(durationMs)}</span>
        {/* Machine output is always labelled as such (usability requirement). */}
        <Badge variant="outline" className="ml-auto">
          Machine output
        </Badge>
      </div>

      <dl className="divide-y rounded-lg border text-sm">
        <div className="flex items-center justify-between gap-4 px-3 py-2.5">
          <dt className="text-muted-foreground">Prediction</dt>
          <dd className="font-mono tabular-nums">{response.prediction}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 px-3 py-2.5">
          <dt className="text-muted-foreground">Model version</dt>
          <dd>
            <Badge variant="secondary" className="font-mono">
              {response.model_version}
            </Badge>
          </dd>
        </div>
      </dl>

      {isMock && (
        <p className="text-xs text-muted-foreground">
          Placeholder output from the mock model. Real transcriptions arrive with the trained
          models.
        </p>
      )}

      <div className="overflow-hidden rounded-lg border">
        <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">Raw response</span>
          <Button variant="ghost" size="xs" onClick={copyJson}>
            <CopyIcon />
            Copy
          </Button>
        </div>
        <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed">{json}</pre>
      </div>
    </section>
  )
}
