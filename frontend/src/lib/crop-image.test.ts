import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cropImage } from './crop-image'

describe('cropImage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('converts a percentage crop to original image pixels', async () => {
    const drawImage = vi.fn()

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage,
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low',
    } as unknown as CanvasRenderingContext2D)

    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => {
      callback(new Blob(['cropped'], { type: 'image/png' }))
    })

    const file = new File(['image'], 'digit.png', {
      type: 'image/png',
    })

    const image = {
      naturalWidth: 1000,
      naturalHeight: 800,
    } as HTMLImageElement

    const result = await cropImage(file, image, {
      unit: '%',
      x: 10,
      y: 20,
      width: 50,
      height: 25,
    })

    expect(drawImage).toHaveBeenCalledWith(image, 100, 160, 500, 200, 0, 0, 500, 200)

    expect(result.name).toBe('digit-cropped.png')
    expect(result.type).toBe('image/png')
  })

  it('throws when the cropped image cannot be exported', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low',
    } as unknown as CanvasRenderingContext2D)

    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => {
      callback(null)
    })

    const file = new File(['image'], 'digit.jpg', {
      type: 'image/jpeg',
    })

    const image = {
      naturalWidth: 1000,
      naturalHeight: 800,
    } as HTMLImageElement

    await expect(
      cropImage(file, image, {
        unit: '%',
        x: 10,
        y: 10,
        width: 80,
        height: 80,
      })
    ).rejects.toThrow('Could not create the cropped image.')
  })
})
