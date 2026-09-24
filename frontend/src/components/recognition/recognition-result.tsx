'use client'

import { toast } from 'sonner'
import { Annotation } from '@/components/ui/annotation'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import type { PredictResult } from '@/hooks/use-predict'
import { formatDuration } from '@/lib/format'
import { highlightJson, type JsonTokenKind } from '@/lib/highlight-json'

const MOCK_MODEL_VERSION = 'mock'

const TOKEN_CLASS: Record<JsonTokenKind, string> = {
  key: 'text-sky-700 dark:text-[#66d9ef]',
  string: 'text-lime-700 dark:text-lime',
  literal: 'text-pink-600 dark:text-[#f92672]',
  plain: 'text-muted-foreground',
}

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
    <section aria-label="Model response" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-medium">
          Response received <Annotation>{formatDuration(durationMs)}</Annotation>
        </p>
        <Chip>Machine output</Chip>
      </div>

      <dl className="space-y-2">
        <div className="flex items-center justify-between gap-4 rounded-xl bg-muted px-4 py-3">
          <dt className="text-muted-foreground">Prediction</dt>
          <dd className="text-2xl font-medium tabular-nums">{response.prediction}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl bg-muted px-4 py-3">
          <dt className="text-muted-foreground">Model version</dt>
          <dd className="font-mono text-sm">{response.model_version}</dd>
        </div>
      </dl>

      {isMock && (
        <p className="text-sm text-muted-foreground">
          Placeholder output from the mock model. Real transcriptions arrive with the trained
          models.
        </p>
      )}

      <div className="overflow-hidden rounded-2xl bg-background">
        <div className="flex items-center justify-between px-4 pt-3">
          <span className="font-mono text-sm text-foreground">response.json</span>
          <Button variant="ghost" size="xs" onClick={copyJson}>
            Copy
          </Button>
        </div>
        <pre className="overflow-x-auto px-4 pt-2 pb-4 font-mono text-sm leading-relaxed">
          {highlightJson(json).map((token, i) => (
            <span key={i} className={TOKEN_CLASS[token.kind]}>
              {token.text}
            </span>
          ))}
        </pre>
      </div>
    </section>
  )
}
