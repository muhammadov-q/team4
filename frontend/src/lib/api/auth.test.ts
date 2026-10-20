import { afterEach, describe, expect, it, vi } from 'vitest'
import { getCurrentUser, signIn, signOut, signUp } from './auth'
import { ApiError } from './client'

afterEach(() => {
  vi.unstubAllGlobals()
})

function stubFetch(response: Response) {
  const fetch = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetch)
  return fetch
}

const call = (fetch: ReturnType<typeof vi.fn>) => fetch.mock.calls[0] as [string, RequestInit]

const ADA = { id: 1, email: 'ada@example.com' }
const CREDENTIALS = { email: 'ada@example.com', password: 'correct horse' }

describe('auth API', () => {
  it.each([
    ['signs up', signUp, '/api/auth/sign-up'],
    ['signs in', signIn, '/api/auth/sign-in'],
  ])('%s with the credentials as JSON', async (_name, send, path) => {
    const fetch = stubFetch(Response.json(ADA))

    await expect(send(CREDENTIALS)).resolves.toEqual(ADA)

    const [url, init] = call(fetch)
    expect(url).toBe(path)
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual(CREDENTIALS)
  })

  it('signs out', async () => {
    const fetch = stubFetch(new Response(null, { status: 204 }))
    await expect(signOut()).resolves.toBeUndefined()
    expect(call(fetch)[0]).toBe('/api/auth/sign-out')
    expect(call(fetch)[1].method).toBe('POST')
  })

  it('reads the signed-in user', async () => {
    const fetch = stubFetch(Response.json(ADA))
    await expect(getCurrentUser()).resolves.toEqual(ADA)
    expect(call(fetch)[0]).toBe('/api/auth/me')
  })

  it("passes on the backend's message and status", async () => {
    stubFetch(Response.json({ detail: 'Wrong email or password.' }, { status: 401 }))
    const error = await signIn(CREDENTIALS).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ message: 'Wrong email or password.', status: 401 })
  })

  it.each([
    ['sign up', () => signUp(CREDENTIALS), 'Could not create your account. Try again.'],
    ['sign in', () => signIn(CREDENTIALS), 'Could not sign you in. Try again.'],
    ['sign out', () => signOut(), 'Could not sign you out. Try again.'],
    ['me', () => getCurrentUser(), 'Could not load your account.'],
  ])('falls back to a plain message when %s fails without one', async (_name, send, message) => {
    stubFetch(new Response('oops', { status: 500 }))
    await expect(send()).rejects.toThrow(message)
  })
})
