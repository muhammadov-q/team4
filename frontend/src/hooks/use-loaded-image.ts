'use client'

import { useCallback, useState } from 'react'
import type { ImageSource } from '@/lib/image-file'
import type { ImageSize } from '@/lib/words'

export function useLoadedImage(image: ImageSource) {
  const [loaded, setLoaded] = useState<{ image: ImageSource; size: ImageSize } | null>(null)

  const ref = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img || typeof image === 'string') return

      const url = URL.createObjectURL(image)
      img.src = url

      return () => URL.revokeObjectURL(url)
    },
    [image]
  )

  return {
    size: loaded?.image === image ? loaded.size : null,
    imageProps: {
      ref,
      src: typeof image === 'string' ? image : undefined,
      onLoad: (event: React.SyntheticEvent<HTMLImageElement>) =>
        setLoaded({
          image,
          size: {
            width: event.currentTarget.naturalWidth,
            height: event.currentTarget.naturalHeight,
          },
        }),
    },
  }
}
