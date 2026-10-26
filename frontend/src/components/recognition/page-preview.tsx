'use client'

import { CropIcon, ImageUpIcon, SmartphoneIcon, XIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import type { WordSelection } from '@/hooks/use-word-selection'
import { IMAGE_ACCEPT, formatBytes } from '@/lib/image-file'
import type { Word } from '@/lib/words'
import { Annotation } from '@/components/ui/annotation'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { PageScan } from '@/components/transcript/page-scan'

interface PagePreviewProps {
  file: File
  words?: Word[]
  selection?: WordSelection
  onReplace: (file: File) => void
  onCrop: () => void
  onRemove: () => void
  onUsePhone?: () => void
}

export function PagePreview({
  file,
  words,
  selection,
  onReplace,
  onCrop,
  onRemove,
  onUsePhone,
}: PagePreviewProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [unpreviewable, setUnpreviewable] = useState<File | null>(null)

  const canCrop = file.type !== 'image/tiff' && unpreviewable !== file

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl bg-card">
        <div className="flex items-center justify-between gap-3 py-2 pr-2 pl-5">
          <p className="min-w-0 truncate text-sm" title={file.name}>
            <span className="font-medium">{file.name}</span>{' '}
            <Annotation>{formatBytes(file.size)}</Annotation>
          </p>

          <TooltipProvider>
            <div className="flex shrink-0 gap-1">
              {onUsePhone && (
                <ToolButton
                  label="Use phone"
                  className="pointer-coarse:hidden"
                  onClick={onUsePhone}
                >
                  <SmartphoneIcon />
                </ToolButton>
              )}
              <ToolButton label="Replace page" onClick={() => inputRef.current?.click()}>
                <ImageUpIcon />
              </ToolButton>
              <ToolButton label="Crop" onClick={onCrop} disabled={!canCrop}>
                <CropIcon />
              </ToolButton>
              <ToolButton label="Remove page" onClick={onRemove}>
                <XIcon />
              </ToolButton>
            </div>
          </TooltipProvider>
        </div>

        <div className="grid min-h-72 place-items-center px-4 pb-4">
          {unpreviewable === file ? (
            <p className="max-w-xs p-6 text-center text-sm text-muted-foreground">
              This browser can&apos;t preview this image (TIFF usually). The page is still sent as
              it is.
            </p>
          ) : (
            <PageScan
              image={file}
              alt={`Preview of ${file.name}`}
              words={words}
              selection={selection}
              onError={() => setUnpreviewable(file)}
            />
          )}
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

function ToolButton({
  label,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={label} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
