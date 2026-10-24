'use client'

import { Annotation } from '@/components/ui/annotation'
import { Chip } from '@/components/ui/chip'
import { WordDetails } from '@/components/transcript/word-details'
import type { Prediction } from '@/lib/api/predict'
import { formatDuration } from '@/lib/format'
import { hasBox } from '@/lib/words'

const MOCK_MODEL_VERSION = 'mock'

interface RecognitionResultProps {
  recognition: Prediction
  durationMs?: number
  selected: number | null
  onSelect: (index: number) => void
}

export function RecognitionResult({
  recognition,
  durationMs,
  selected,
  onSelect,
}: RecognitionResultProps) {
  const { predictions: words, model_version: modelVersion } = recognition
  const isMock = modelVersion === MOCK_MODEL_VERSION

  return (
    <section aria-label="Model response" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-medium">
          Result {durationMs !== undefined && <Annotation>{formatDuration(durationMs)}</Annotation>}
        </p>
        <Chip>Machine output</Chip>
      </div>

      {words.length > 0 ? (
        <WordDetails words={words} selected={selected} onSelect={onSelect} />
      ) : (
        <div className="space-y-1 rounded-xl bg-muted px-5 py-4">
          <p className="text-lg font-medium">No words found</p>
          <p className="text-sm text-muted-foreground">
            Try a closer photo with dark ink on plain paper.
          </p>
        </div>
      )}

      <div className="space-y-1 text-sm text-muted-foreground">
        {words.some((word) => hasBox(word.box)) && (
          <p>The boxes on your page show where each word was found.</p>
        )}
        <p>
          Read by <span className="font-mono text-foreground">{modelVersion}</span>
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
