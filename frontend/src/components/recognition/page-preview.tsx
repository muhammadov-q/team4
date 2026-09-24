'use client'

import { useCallback, useRef, useState } from 'react'
import { IMAGE_ACCEPT, formatBytes } from '@/lib/image-file'
import { Annotation } from '@/components/ui/annotation'
import { Button } from '@/components/ui/button'

interface PagePreviewProps {
  file: File
  onReplace: (file: File) => void
  onRemove: () => void
}

export function PagePreview({ file, onReplace, onRemove }: PagePreviewProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [unpreviewable, setUnpreviewable] = useState<File | null>(null)

  const attachPreview = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img) return
      const url = URL.createObjectURL(file)
      img.src = url
      return () => URL.revokeObjectURL(url)
    },
    [file]
  )

  return (
    <div className="space-y-5">
      <div className="flex min-h-72 items-center justify-center overflow-hidden rounded-2xl bg-card p-4">
        {unpreviewable === file ? (
          <p className="max-w-xs p-6 text-center text-sm text-muted-foreground">
            This browser can&apos;t preview this image (TIFF usually). The page is still sent as it
            is.
          </p>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={attachPreview}
            alt={`Preview of ${file.name}`}
            onError={() => setUnpreviewable(file)}
            className="block max-h-[70vh] w-auto max-w-full rounded-md"
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium" title={file.name}>
            {file.name}
          </p>
          <Annotation>{formatBytes(file.size)}</Annotation>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            Replace
          </Button>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            Remove
          </Button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        aria-label="Replacement page image"
        tabIndex={-1}
        className="sr-only"
        onChange={(event) => {
          const next = event.target.files?.[0]
          event.target.value = ''
          if (next) onReplace(next)
        }}
      />
    </div>
  )
}
