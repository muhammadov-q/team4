import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiRequest, errorMessageFromBody } from './client'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('errorMessageFromBody', () => {
  it('uses an HTTPException detail string', () => {
    expect(errorMessageFromBody({ detail: 'File must be an image' }, 'fallback')).toBe(
      'File must be an image'
    )
  })

  it('joins validation error messages', () => {
    const body = { detail: [{ msg: 'Field required' }, { msg: 'Input should be a file' }] }
    expect(errorMessageFromBody(body, 'fallback')).toBe('Field required; Input should be a file')
  })

  it.each([null, {}, { detail: '' }, { detail: [] }, 'oops'])('falls back for %j', (body) => {
    expect(errorMessageFromBody(body, 'fallback')).toBe('fallback')
  })
})

describe('apiRequest', () => {
  it('prefixes the proxy path and parses JSON', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ ok: true }))
    vi.stubGlobal('fetch', fetch)

    await expect(apiRequest('/health')).resolves.toEqual({ ok: true })
    expect(fetch).toHaveBeenCalledWith('/api/health', expect.objectContaining({ method: 'GET' }))
  })

  it('sends FormData as is, so the browser sets the multipart boundary', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({}))
    vi.stubGlobal('fetch', fetch)
    const body = new FormData()

    await apiRequest('/predict', { method: 'POST', body })
    const init = fetch.mock.calls[0][1] as RequestInit
    expect(init.body).toBe(body)
    expect(init.headers).toBeUndefined()
  })

  it('serializes other bodies as JSON', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetch)

    await expect(apiRequest('/lines/1', { method: 'PATCH', body: { text: 'dñs' } })).resolves.toBe(
      undefined
    )
    const init = fetch.mock.calls[0][1] as RequestInit
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(init.body).toBe('{"text":"dñs"}')
  })

  it('throws ApiError with the status and the backend message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ detail: 'File must be an image' }, { status: 415 }))
    )

    const error = await apiRequest('/predict').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 415, message: 'File must be an image' })
  })

  it('uses the fallback when the error body is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>', { status: 500 })))

    await expect(apiRequest('/predict', { fallback: 'Model failed' })).rejects.toMatchObject({
      status: 500,
      message: 'Model failed',
    })
  })

  it('reports a network failure as status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(apiRequest('/predict')).rejects.toMatchObject({ status: 0 })
  })

  it('rethrows an abort instead of calling it a network failure', async () => {
    const controller = new AbortController()
    controller.abort()
    const abort = new DOMException('Aborted', 'AbortError')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abort))

    await expect(apiRequest('/predict', { signal: controller.signal })).rejects.toBe(abort)
  })
})
