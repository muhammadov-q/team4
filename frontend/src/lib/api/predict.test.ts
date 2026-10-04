import { afterEach, describe, expect, it, vi } from 'vitest'
import { predictImage } from './predict'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('predictImage', () => {
  it('posts the page as the multipart field `image`', async () => {
    const body = {
      predictions: [{ digit: 7, probabilities: { '7': 0.9 }, box: { x: 1, y: 2, w: 3, h: 4 } }],
      model_version: 'KNN-100126',
    }
    const fetch = vi.fn().mockResolvedValue(Response.json(body))
    vi.stubGlobal('fetch', fetch)
    const page = new File(['bytes'], 'folio-1r.png', { type: 'image/png' })

    const response = await predictImage(page)

    expect(response).toEqual(body)
    const [url, init] = fetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/predict')
    expect(init.method).toBe('POST')
    expect((init.body as FormData).get('image')).toBe(page)
  })

  it('passes the abort signal through', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ predictions: [], model_version: 'm' }))
    vi.stubGlobal('fetch', fetch)
    const controller = new AbortController()

    await predictImage(new File(['x'], 'p.png', { type: 'image/png' }), controller.signal)
    expect((fetch.mock.calls[0][1] as RequestInit).signal).toBe(controller.signal)
  })
})
