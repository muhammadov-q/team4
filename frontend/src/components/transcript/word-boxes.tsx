import { cn } from '@/lib/utils'
import type { WordSelection } from '@/hooks/use-word-selection'
import { boxToPercent, hasBox, type ImageSize, type Word } from '@/lib/words'

interface WordBoxesProps {
  words: Word[]
  image: ImageSize
  selection: WordSelection
}

export function WordBoxes({ words, image, selection }: WordBoxesProps) {
  return (
    <>
      {words.map((word, index) => {
        if (!hasBox(word.box)) return null

        const box = boxToPercent(word.box, image)
        const isSelected = index === selection.selected

        // Mouse shortcut only: the transcript holds the same words as real buttons
        return (
          <button
            key={index}
            type="button"
            tabIndex={-1}
            aria-hidden
            data-testid="word-box"
            data-selected={isSelected || undefined}
            onClick={() => selection.select(index)}
            onMouseEnter={() => selection.hover(index)}
            onMouseLeave={() => selection.hover(null)}
            className={cn(
              'absolute cursor-pointer rounded-sm transition-colors',
              isSelected
                ? 'bg-primary/25 shadow-[0_0_0_3px_rgb(0_0_0/0.45)] ring-2 ring-primary'
                : index === selection.hovered
                  ? 'bg-primary/15 ring-2 ring-primary'
                  : 'ring-1 ring-primary/40 hover:bg-primary/15 hover:ring-2 hover:ring-primary'
            )}
            style={{
              left: `${box.left}%`,
              top: `${box.top}%`,
              width: `${box.width}%`,
              height: `${box.height}%`,
            }}
          />
        )
      })}
    </>
  )
}
