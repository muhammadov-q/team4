'use client'

import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'
import { Annotation } from '@/components/ui/annotation'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { formatPercent } from '@/lib/format'
import { confidenceOf, positionOf, type Word } from '@/lib/words'

interface WordDetailsProps {
  words: Word[]
  selected: number | null
  onSelect: (index: number) => void
}

export function WordDetails({ words, selected, onSelect }: WordDetailsProps) {
  const word = selected === null ? undefined : words[selected]

  if (selected === null || word === undefined) {
    return (
      <div className="space-y-1 rounded-xl bg-muted px-5 py-4">
        <p className="font-medium">Pick a word</p>
        <p className="text-sm text-muted-foreground">
          Click a word on the page or in the transcript to see where it is, what it means and its
          translation.
        </p>
      </div>
    )
  }

  const position = positionOf(words, selected)
  const { gloss } = word

  return (
    <section aria-label="Selected word" className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-greek text-heading font-medium break-words">{word.text}</p>
          <Annotation>
            Line {position.line}, word {position.word}
          </Annotation>
        </div>
        <Chip className="shrink-0">Machine translation</Chip>
      </div>

      {gloss ? (
        <dl className="space-y-2">
          <Entry term="Translation">
            <span className="text-lg font-medium">{gloss.translation}</span>
          </Entry>
          <Entry term="Dictionary form">
            <span className="font-greek text-lg">{gloss.lemma}</span>
          </Entry>
          <Entry term="Definition">{gloss.definition}</Entry>
        </dl>
      ) : (
        <div className="space-y-1 rounded-xl bg-muted px-5 py-4">
          <p className="font-medium">No translation yet</p>
          <p className="text-sm text-muted-foreground">
            The model read this word but has no translation for it.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Annotation>Read with {formatPercent(confidenceOf(word))} confidence</Annotation>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={selected === 0}
            onClick={() => onSelect(selected - 1)}
          >
            <ArrowLeftIcon />
            Previous word
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={selected === words.length - 1}
            onClick={() => onSelect(selected + 1)}
          >
            Next word
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </section>
  )
}

function Entry({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1 rounded-xl bg-muted px-5 py-4">
      <dt className="text-sm text-muted-foreground">{term}</dt>
      <dd>{children}</dd>
    </div>
  )
}
