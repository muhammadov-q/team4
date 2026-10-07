'use client'

import { ImageUpIcon, SmartphoneIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { cn } from 'cn'
import { IMAGE_ACCEPT } from '@/lib/image-file'
import { Button } from '@/components/ui/button'

interface PageDropzoneProps {
  onFile: (file: File) => void
  onUsePhone: () => void
}

export function PageDropzone({ onFile, onUsePhone }: PageDropzoneProps) {
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
      onClick={(event) => {
        if (!(event.target as HTMLElement).closest('button, input')) inputRef.current?.click()
      }}
      className={cn(
        'flex min-h-80 w-full cursor-pointer flex-col justify-between gap-8 rounded-xl bg-muted p-8 outline-2 outline-transparent transition-colors lg:p-10',
        dragging && 'outline-primary'
      )}
    >
      <ImageUpIcon className="size-7 text-foreground" />
      <div className="space-y-2">
        <p className="text-2xl font-medium">
          {dragging ? 'Drop to add the page' : 'Drop a page image here'}
        </p>
        <p className="text-muted-foreground">or paste one from your clipboard</p>
      </div>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => inputRef.current?.click()}>Choose image</Button>
          <Button variant="outline" className="pointer-coarse:hidden" onClick={onUsePhone}>
            <SmartphoneIcon />
            Use your phone
          </Button>
        </div>
        <p className="font-mono text-xs text-muted-foreground">JPG, PNG or TIFF, up to 50 MB</p>
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
