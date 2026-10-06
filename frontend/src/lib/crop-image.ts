import type { PercentCrop } from 'react-image-crop'

function outputTypeFor(file: File): 'image/png' | 'image/jpeg' {
  return file.type === 'image/png' ? 'image/png' : 'image/jpeg'
}

function outputNameFor(file: File, type: 'image/png' | 'image/jpeg'): string {
  const baseName = file.name.replace(/\.[^.]+$/, '')
  const extension = type === 'image/png' ? 'png' : 'jpg'

  return `${baseName}-cropped.${extension}`
}

export async function cropImage(
  file: File,
  image: HTMLImageElement,
  crop: PercentCrop
): Promise<File> {
  if (crop.width <= 0 || crop.height <= 0) {
    throw new Error('The crop area is empty.')
  }

  // Percent crop → original image pixels.
  // This stays correct even if the browser window/image display size changes.
  const sourceX = Math.round((crop.x / 100) * image.naturalWidth)
  const sourceY = Math.round((crop.y / 100) * image.naturalHeight)
  const sourceWidth = Math.round((crop.width / 100) * image.naturalWidth)
  const sourceHeight = Math.round((crop.height / 100) * image.naturalHeight)

  const canvas = document.createElement('canvas')
  canvas.width = sourceWidth
  canvas.height = sourceHeight

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Could not create the crop canvas.')
  }

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    sourceWidth,
    sourceHeight
  )

  const outputType = outputTypeFor(file)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result)
        } else {
          reject(new Error('Could not create the cropped image.'))
        }
      },
      outputType,
      0.92
    )
  })

  return new File([blob], outputNameFor(file, outputType), {
    type: outputType,
    lastModified: Date.now(),
  })
}
