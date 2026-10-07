import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createCaptureSession,
  deleteCaptureSession,
  downloadCaptureImage,
  getCaptureSession,
  uploadCaptureImage,
} from './capture-sessions'

afterEach(() => {
  vi.unstubAllGlobals()
})

function stubFetch(response: Response) {
  const fetch = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetch)
  return fetch
}

const call = (fetch: ReturnType<typeof vi.fn>) => fetch.mock.calls[0] as [string, RequestInit]

describe('capture sessions API', () => {
  it('creates a session', async () => {
    const fetch = stubFetch(Response.json({ id: 'abc', upload_count: 0 }, { status: 201 }))
    await expect(createCaptureSession()).resolves.toEqual({ id: 'abc', upload_count: 0 })
    expect(call(fetch)[0]).toBe('/api/capture-sessions')
    expect(call(fetch)[1].method).toBe('POST')
  })

  it('reads a session, escaping its id', async () => {
    const fetch = stubFetch(Response.json({ id: 'a/b', upload_count: 2 }))
    await getCaptureSession('a/b')
    expect(call(fetch)[0]).toBe('/api/capture-sessions/a%2Fb')
  })

  it('puts the photo as the multipart field `image`', async () => {
    const fetch = stubFetch(Response.json({ id: 'abc', upload_count: 1 }))
    const photo = new File(['jpeg'], 'image.jpg', { type: 'image/jpeg' })
    await uploadCaptureImage('abc', photo)
    const [url, init] = call(fetch)
    expect(url).toBe('/api/capture-sessions/abc/image')
    expect(init.method).toBe('PUT')
    expect((init.body as FormData).get('image')).toBe(photo)
  })

  it('downloads the photo as a named file of its own type', async () => {
    stubFetch(
      new Response(new Blob(['jpeg'], { type: 'image/jpeg' }), {
        headers: { 'Content-Type': 'image/jpeg' },
      })
    )
    const file = await downloadCaptureImage('abc', 3)
    expect(file.name).toBe('Phone photo 3.jpg')
    expect(file.type).toBe('image/jpeg')
  })

  it('deletes a session', async () => {
    const fetch = stubFetch(new Response(null, { status: 204 }))
    await expect(deleteCaptureSession('abc')).resolves.toBeUndefined()
    expect(call(fetch)[1].method).toBe('DELETE')
  })

  it('reports an expired session as a 404 with the backend message', async () => {
    stubFetch(Response.json({ detail: 'This phone link has expired.' }, { status: 404 }))
    await expect(getCaptureSession('old')).rejects.toMatchObject({
      status: 404,
      message: 'This phone link has expired.',
    })
  })
})
