'use client'

import { cn } from '@/lib/utils'
import { Annotation } from '@/components/ui/annotation'
import { Card } from '@/components/ui/card'
import { Chip } from '@/components/ui/chip'
import { groupLines, type Word } from '@/lib/words'

interface TranscriptProps {
  words: Word[]
  selected: number | null
  onSelect: (index: number) => void
}

export function Transcript({ words, selected, onSelect }: TranscriptProps) {
  const lines = groupLines(words)

  return (
    <Card role="region" aria-label="Transcript" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <p className="font-medium">Transcript</p>
          <Annotation>
            {count(words.length, 'word')} on {count(lines.length, 'line')}
          </Annotation>
        </div>
        <Chip>Machine output</Chip>
      </div>

      {lines.length === 0 ? (
        <p className="text-muted-foreground">The model found no words on this page.</p>
      ) : (
        <>
          <ol className="space-y-2">
            {lines.map((line) => (
              <li key={line.number} className="grid grid-cols-[2rem_1fr] items-baseline gap-2">
                <Annotation>
                  <span className="sr-only">Line </span>
                  {line.number}
                </Annotation>
                <p className="flex flex-wrap gap-x-1 gap-y-0.5 font-greek leading-relaxed">
                  {line.words.map(({ word, index }) => (
                    <button
                      key={index}
                      type="button"
                      aria-pressed={index === selected}
                      onClick={() => onSelect(index)}
                      className={cn(
                        'rounded-md px-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        index === selected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      )}
                    >
                      {word.text}
                    </button>
                  ))}
                </p>
              </li>
            ))}
          </ol>
          <p className="text-sm text-muted-foreground">
            Pick a word here or on the page to see its translation.
          </p>
        </>
      )}
    </Card>
  )
}

function count(n: number, noun: string): string {
  return `${n} ${noun}${n === 1 ? '' : 's'}`
}
