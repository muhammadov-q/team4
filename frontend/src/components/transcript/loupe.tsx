'use client'

import { useLoadedImage } from '@/hooks/use-loaded-image'
import type { ImageSource } from '@/lib/image-file'
import { loupeCrop, type WordBox } from '@/lib/words'

const ASPECT = 3

interface LoupeProps {
  image: ImageSource
  box: WordBox
  word: string
}

export function Loupe({ image, box, word }: LoupeProps) {
  const { size, imageProps } = useLoadedImage(image)
  const crop = size ? loupeCrop(box, ASPECT, size) : null
  const percent = (value: number, of: number) => `${(value / of) * 100}%`

  return (
    <div
      role="img"
      aria-label={`Close-up of ${word} on the page`}
      className="relative aspect-[3/1] overflow-hidden rounded-2xl bg-muted"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...imageProps}
        alt=""
        className="absolute max-w-none motion-safe:transition-[left,top,width,height] motion-safe:duration-300 motion-safe:ease-out"
        style={
          size && crop
            ? {
                left: percent(-crop.x, crop.w),
                top: percent(-crop.y, crop.h),
                width: percent(size.width, crop.w),
                height: percent(size.height, crop.h),
              }
            : { visibility: 'hidden' }
        }
      />
      {crop && (
        <div
          aria-hidden
          className="absolute rounded-sm ring-2 ring-primary motion-safe:transition-[left,top,width,height] motion-safe:duration-300 motion-safe:ease-out"
          style={{
            left: percent(box.x - crop.x, crop.w),
            top: percent(box.y - crop.y, crop.h),
            width: percent(box.w, crop.w),
            height: percent(box.h, crop.h),
          }}
        />
      )}
    </div>
  )
}
