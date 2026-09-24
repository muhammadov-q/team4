'use client'

import { ImageUpIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { IMAGE_ACCEPT } from '@/lib/image-file'

export function PageDropzone({ onFile }: { onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        // dragleave also fires when moving onto a child; only reset when leaving the zone.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        const file = event.dataTransfer.files[0]
        if (file) onFile(file)
      }}
      className={cn(
        'flex min-h-72 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors lg:min-h-105',
        dragging ? 'border-primary bg-accent' : 'border-border'
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <ImageUpIcon className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">Drop a page image here</p>
        <p className="text-sm text-muted-foreground">or paste one from your clipboard</p>
      </div>
      <Button size="lg" onClick={() => inputRef.current?.click()}>
        Choose image
      </Button>
      <p className="text-xs text-muted-foreground">JPG, PNG or TIFF, up to 50 MB</p>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        aria-label="Page image"
        tabIndex={-1}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          // Clear it so picking the same file again still fires onChange.
          event.target.value = ''
          if (file) onFile(file)
        }}
      />
    </div>
  )
}
