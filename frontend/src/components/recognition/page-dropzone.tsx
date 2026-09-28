'use client'

import { ImageUpIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { cn } from 'cn'
import { IMAGE_ACCEPT } from '@/lib/image-file'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'

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
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        const file = event.dataTransfer.files[0]
        if (file) onFile(file)
      }}
      className={cn(
        'flex min-h-80 w-full flex-col justify-between gap-8 rounded-xl bg-muted p-8 outline-2 outline-transparent transition-colors lg:p-10',
        dragging && 'outline-primary'
      )}
    >
      <ImageUpIcon className="size-7 text-foreground" />
      <div className="space-y-2">
        <p className="text-2xl font-medium">Drop a page image here</p>
        <p className="text-muted-foreground">or paste one from your clipboard</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => inputRef.current?.click()}>Choose image</Button>
        {['JPG', 'PNG', 'TIFF', 'Up to 50 MB'].map((label) => (
          <Chip key={label}>{label}</Chip>
        ))}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        aria-label="Page image"
        tabIndex={-1}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) onFile(file)
        }}
      />
    </div>
  )
}
