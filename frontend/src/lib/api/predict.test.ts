import { afterEach, describe, expect, it, vi } from 'vitest'
import { predictImage } from './predict'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('predictImage', () => {
  it('posts the page as the multipart field `image`', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(Response.json({ prediction: 250000, model_version: 'mock' }))
    vi.stubGlobal('fetch', fetch)
    const page = new File(['bytes'], 'folio-1r.png', { type: 'image/png' })

    const response = await predictImage(page)

    expect(response).toEqual({ prediction: 250000, model_version: 'mock' })
    const [url, init] = fetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/predict')
    expect(init.method).toBe('POST')
    expect((init.body as FormData).get('image')).toBe(page)
  })

  it('passes the abort signal through', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ prediction: 1, model_version: 'm' }))
    vi.stubGlobal('fetch', fetch)
    const controller = new AbortController()

    await predictImage(new File(['x'], 'p.png', { type: 'image/png' }), controller.signal)
    expect((fetch.mock.calls[0][1] as RequestInit).signal).toBe(controller.signal)
  })
})
