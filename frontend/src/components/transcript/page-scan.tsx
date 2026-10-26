'use client'

import { cn } from '@/lib/utils'
import type { WordSelection } from '@/hooks/use-word-selection'
import { useLoadedImage } from '@/hooks/use-loaded-image'
import type { ImageSource } from '@/lib/image-file'
import { lineSpans, type ImageSize, type Word } from '@/lib/words'
import { WordBoxes } from './word-boxes'

interface PageScanProps {
  image: ImageSource
  alt: string
  words?: Word[]
  selection?: WordSelection
  onError?: () => void
}

export function PageScan({ image, alt, words, selection, onError }: PageScanProps) {
  const { size, imageProps } = useLoadedImage(image)
  const marks = size && words && selection ? { size, words, selection } : null

  return (
    <div className="flex max-w-full items-stretch gap-2">
      {marks && <LineNumbers {...marks} />}
      <div className="relative min-w-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          {...imageProps}
          alt={alt}
          onError={onError}
          className="block max-h-[70vh] w-auto max-w-full rounded-md"
        />
        {marks && <WordBoxes words={marks.words} image={marks.size} selection={marks.selection} />}
      </div>
    </div>
  )
}

interface LineNumbersProps {
  size: ImageSize
  words: Word[]
  selection: WordSelection
}

function LineNumbers({ size, words, selection }: LineNumbersProps) {
  const spans = lineSpans(words)
  if (spans.length === 0) return null

  const selectedLine = selection.selected === null ? null : words[selection.selected]?.line

  return (
    <div aria-hidden data-testid="line-numbers" className="relative w-6 shrink-0">
      {spans.map((span) => (
        <span
          key={span.line}
          className={cn(
            'absolute right-0 -translate-y-1/2 rounded px-1 font-mono text-caption leading-tight tabular-nums',
            span.line === selectedLine ? 'bg-primary text-primary-foreground' : 'text-subtle'
          )}
          style={{ top: `${((span.top + span.bottom) / 2 / size.height) * 100}%` }}
        >
          {span.line + 1}
        </span>
      ))}
    </div>
  )
}
