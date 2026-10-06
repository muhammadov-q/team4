'use client'

import { SmartphoneIcon } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import type { DigitPrediction, ImageSize } from '@/lib/digits'
import { IMAGE_ACCEPT, formatBytes } from '@/lib/image-file'
import { Annotation } from '@/components/ui/annotation'
import { Button } from '@/components/ui/button'
import { DigitBoxes } from './digit-boxes'

interface PagePreviewProps {
  file: File
  predictions?: DigitPrediction[]
  onReplace: (file: File) => void
  onCrop: () => void
  onRemove: () => void
  onUsePhone?: () => void
}

export function PagePreview({
  file,
  predictions,
  onReplace,
  onCrop,
  onRemove,
  onUsePhone,
}: PagePreviewProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [unpreviewable, setUnpreviewable] = useState<File | null>(null)
  const [loaded, setLoaded] = useState<{ file: File; size: ImageSize } | null>(null)
  const size = loaded?.file === file ? loaded.size : null

  const attachPreview = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img) return

      const url = URL.createObjectURL(file)
      img.src = url

      return () => URL.revokeObjectURL(url)
    },
    [file]
  )

  const canCrop = file.type !== 'image/tiff' && unpreviewable !== file

  return (
    <div className="space-y-5">
      <div className="grid min-h-72 place-items-center overflow-hidden rounded-2xl bg-card p-4">
        {unpreviewable === file ? (
          <p className="max-w-xs p-6 text-center text-sm text-muted-foreground">
            This browser can&apos;t preview this image (TIFF usually). The page is still sent as it
            is.
          </p>
        ) : (
          <div className="relative max-w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={attachPreview}
              alt={`Preview of ${file.name}`}
              onLoad={(event) =>
                setLoaded({
                  file,
                  size: {
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  },
                })
              }
              onError={() => setUnpreviewable(file)}
              className="block max-h-[70vh] w-auto max-w-full rounded-md"
            />
            {size && predictions && <DigitBoxes predictions={predictions} image={size} />}
          </div>
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
          {onUsePhone && (
            <Button
              variant="outline"
              size="sm"
              className="pointer-coarse:hidden"
              onClick={onUsePhone}
            >
              <SmartphoneIcon />
              Use phone
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            Replace
          </Button>

          <Button variant="outline" size="sm" onClick={onCrop} disabled={!canCrop}>
            Crop
          </Button>

          <Button variant="ghost" size="sm" onClick={onRemove}>
            Remove
          </Button>
        </div>
      </div>

      {!canCrop && (
        <p className="text-sm text-muted-foreground">
          This image cannot be cropped because it cannot be previewed in the browser.{' '}
        </p>
      )}

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

          if (next) {
            onReplace(next)
          }
        }}
      />
    </div>
  )
}
