'use client'

import { FileImageIcon, RefreshCwIcon, XIcon } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { IMAGE_ACCEPT, formatBytes } from '@/lib/image-file'

interface PagePreviewProps {
  file: File
  onReplace: (file: File) => void
  onRemove: () => void
}

export function PagePreview({ file, onReplace, onRemove }: PagePreviewProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  // Keyed by file, so choosing another page clears it without an effect.
  const [unpreviewable, setUnpreviewable] = useState<File | null>(null)

  // The object URL lives exactly as long as the <img>. A ref callback with cleanup
  // (React 19) survives Strict Mode's double mount, which an effect over state doesn't.
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
    <div className="flex flex-col gap-3">
      <div className="flex min-h-72 items-center justify-center overflow-hidden rounded-lg border bg-muted/50 p-2 lg:min-h-105">
        {unpreviewable === file ? (
          <div className="flex max-w-xs flex-col items-center gap-2 text-center text-sm text-muted-foreground">
            <FileImageIcon className="size-8" />
            <p>
              This browser can&apos;t preview this image (TIFF usually). The page is still sent as
              it is.
            </p>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- blob: previews can't go through next/image
          <img
            ref={attachPreview}
            alt={`Preview of ${file.name}`}
            onError={() => setUnpreviewable(file)}
            className="max-h-[70vh] max-w-full rounded-md object-contain"
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs text-muted-foreground tabular-nums">{formatBytes(file.size)}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            <RefreshCwIcon />
            Replace
          </Button>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <XIcon />
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
