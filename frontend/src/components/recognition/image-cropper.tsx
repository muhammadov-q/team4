'use client'

import { useEffect, useRef, useState } from 'react'
import ReactCrop, { type PercentCrop } from 'react-image-crop'
import { Button } from '@/components/ui/button'
import { cropImage } from '@/lib/crop-image'

interface ImageCropperProps {
  file: File
  onApply: (file: File) => void
  onCancel: () => void
}

const INITIAL_CROP: PercentCrop = {
  unit: '%',
  x: 10,
  y: 10,
  width: 80,
  height: 80,
}

export function ImageCropper({ file, onApply, onCancel }: ImageCropperProps) {
  const imageRef = useRef<HTMLImageElement>(null)

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState<PercentCrop>(INITIAL_CROP)
  const [completedCrop, setCompletedCrop] = useState<PercentCrop>(INITIAL_CROP)
  const [applying, setApplying] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result)
      } else {
        setImageFailed(true)
      }
    }

    reader.onerror = () => {
      setImageFailed(true)
    }

    reader.readAsDataURL(file)

    return () => {
      if (reader.readyState === FileReader.LOADING) {
        reader.abort()
      }
    }
  }, [file])

  async function applyCrop() {
    if (!imageRef.current || !imageLoaded || imageFailed) {
      return
    }

    setApplying(true)
    setError(null)

    try {
      const croppedFile = await cropImage(file, imageRef.current, completedCrop)
      onApply(croppedFile)
    } catch {
      setError('The image could not be cropped. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex min-h-72 items-center justify-center overflow-auto rounded-2xl bg-card p-4">
        {imageFailed ? (
          <p role="alert" className="max-w-xs text-center text-sm text-muted-foreground">
            This image cannot be previewed, so it cannot be cropped.
          </p>
        ) : imageUrl ? (
          <ReactCrop
            crop={crop}
            onChange={(_pixelCrop, percentCrop) => setCrop(percentCrop)}
            onComplete={(_pixelCrop, percentCrop) => setCompletedCrop(percentCrop)}
            minWidth={20}
            minHeight={20}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={imageUrl}
              alt={`Crop ${file.name}`}
              onLoad={() => {
                setImageLoaded(true)
                setImageFailed(false)
              }}
              onError={() => {
                setImageLoaded(false)
                setImageFailed(true)
              }}
              className="block max-h-[70vh] max-w-full"
            />
          </ReactCrop>
        ) : (
          <p className="text-sm text-muted-foreground">Loading image...</p>
        )}
      </div>

      <div>
        <p className="font-medium">Crop image</p>
        <p className="text-sm text-muted-foreground">
          Drag the rectangle or its edges to select the area you want to recognize.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-foreground">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={applying}>
          Cancel
        </Button>

        <Button
          onClick={applyCrop}
          disabled={
            applying ||
            !imageLoaded ||
            imageFailed ||
            completedCrop.width <= 0 ||
            completedCrop.height <= 0
          }
        >
          {applying ? 'Cropping...' : 'Apply crop'}
        </Button>
      </div>
    </div>
  )
}
