// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from './route'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('/api proxy', () => {
  it('forwards method, path, query and body to the backend', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ ok: true }, { status: 201 }))
    vi.stubGlobal('fetch', fetch)

    const res = await POST(
      new Request('http://localhost:3000/api/predict?lang=la', {
        method: 'POST',
        headers: { 'content-type': 'application/octet-stream', connection: 'keep-alive' },
        body: 'page-bytes',
      })
    )

    expect(res.status).toBe(201)
    await expect(res.json()).resolves.toEqual({ ok: true })
    const [url, init] = fetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://localhost:8000/predict?lang=la')
    expect(init.method).toBe('POST')
    expect(new TextDecoder().decode(init.body as ArrayBuffer)).toBe('page-bytes')
    const headers = init.headers as Headers
    expect(headers.get('content-type')).toBe('application/octet-stream')
    expect(headers.has('connection')).toBe(false)
    expect(headers.has('host')).toBe(false)
  })

  it('drops Expect: 100-continue, which fetch refuses to send', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({}))
    vi.stubGlobal('fetch', fetch)

    await POST(
      new Request('http://localhost:3000/api/predict', {
        method: 'POST',
        headers: { expect: '100-continue' },
        body: 'large-scan',
      })
    )

    expect((fetch.mock.calls[0][1].headers as Headers).has('expect')).toBe(false)
  })

  it('keeps the trailing slash and sends no body for GET', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetch)

    await GET(new Request('http://localhost:3000/api/manuscripts/'))

    const [url, init] = fetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://localhost:8000/manuscripts/')
    expect(init.body).toBeUndefined()
  })

  it('drops content-encoding, since fetch already decoded the body', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response('{}', { headers: { 'content-encoding': 'gzip', 'x-request-id': 'abc' } })
        )
    )

    const res = await GET(new Request('http://localhost:3000/api/predict'))

    expect(res.headers.has('content-encoding')).toBe(false)
    expect(res.headers.get('x-request-id')).toBe('abc')
  })

  it('answers 502 with a FastAPI-style detail when the backend is down', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))

    const res = await GET(new Request('http://localhost:3000/api/predict'))

    expect(res.status).toBe(502)
    await expect(res.json()).resolves.toEqual({
      detail: expect.stringContaining('not reachable'),
    })
  })
})
