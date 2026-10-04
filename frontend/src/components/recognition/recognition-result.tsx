'use client'

import { useId } from 'react'
import { Annotation } from '@/components/ui/annotation'
import { Chip } from '@/components/ui/chip'
import type { PredictResult } from '@/hooks/use-predict'
import { confidenceOf, hasBox, readDigits, type DigitPrediction } from '@/lib/digits'
import { formatDuration, formatPercent } from '@/lib/format'

const MOCK_MODEL_VERSION = 'mock'

export function RecognitionResult({ result }: { result: PredictResult }) {
  const { response, durationMs } = result
  const { predictions } = response
  const digits = readDigits(predictions)
  const isMock = response.model_version === MOCK_MODEL_VERSION

  return (
    <section aria-label="Model response" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-medium">
          Result <Annotation>{formatDuration(durationMs)}</Annotation>
        </p>
        <Chip>Machine output</Chip>
      </div>

      <div className="space-y-1 rounded-xl bg-muted px-5 py-4">
        <p className="text-sm text-muted-foreground">Digits read</p>
        {digits ? (
          <p className="text-heading font-medium break-all tabular-nums">{digits}</p>
        ) : (
          <div className="space-y-1">
            <p className="text-lg font-medium">No digits found</p>
            <p className="text-sm text-muted-foreground">
              Try a closer photo with dark ink on plain paper.
            </p>
          </div>
        )}
      </div>

      {predictions.length > 0 && <DigitList predictions={predictions} />}

      <div className="space-y-1 text-sm text-muted-foreground">
        {predictions.some((prediction) => hasBox(prediction.box)) && (
          <p>The boxes on your page show where each digit was found.</p>
        )}
        <p>
          Read by <span className="font-mono text-foreground">{response.model_version}</span>
        </p>
        {isMock && (
          <p>
            Placeholder output from the mock model. Real transcriptions arrive with the trained
            models.
          </p>
        )}
      </div>
    </section>
  )
}

function DigitList({ predictions }: { predictions: DigitPrediction[] }) {
  const labelId = useId()

  return (
    <div className="space-y-2">
      <p id={labelId} className="text-sm text-muted-foreground">
        How sure the model is
      </p>
      <ol
        aria-labelledby={labelId}
        className="grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-2"
      >
        {predictions.map((prediction, index) => (
          <li key={index} className="flex flex-col gap-1 rounded-xl bg-muted px-3 py-2.5">
            <span className="text-2xl font-medium tabular-nums">{prediction.digit}</span>
            <span className="font-mono text-sm text-muted-foreground tabular-nums">
              {formatPercent(confidenceOf(prediction))}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
