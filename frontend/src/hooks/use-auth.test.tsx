import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CURRENT_USER_KEY, useCurrentUser, useSignIn, useSignOut, useSignUp } from './use-auth'

const router = vi.hoisted(() => ({ replace: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => router }))

const ADA = { id: 1, email: 'ada@example.com' }
const CREDENTIALS = { email: 'ada@example.com', password: 'correct horse' }

let queryClient: QueryClient

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  router.replace.mockReset()
})

function renderAuthHook<T>(hook: () => T) {
  return renderHook(hook, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

function stubFetch(response: Response) {
  const fetch = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetch)
  return fetch
}

describe('useCurrentUser', () => {
  it('returns the signed-in user', async () => {
    stubFetch(Response.json(ADA))
    const { result } = renderAuthHook(useCurrentUser)
    await waitFor(() => expect(result.current.data).toEqual(ADA))
    expect(router.replace).not.toHaveBeenCalled()
  })

  it('sends you to sign in when the session has ended', async () => {
    stubFetch(Response.json({ detail: 'Sign in to continue.' }, { status: 401 }))
    renderAuthHook(useCurrentUser)
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/sign-in'))
  })

  it('stays put when the backend fails for another reason', async () => {
    stubFetch(new Response('down', { status: 502 }))
    const { result } = renderAuthHook(useCurrentUser)
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(router.replace).not.toHaveBeenCalled()
  })
})

describe.each([
  ['useSignIn', useSignIn, '/api/auth/sign-in'],
  ['useSignUp', useSignUp, '/api/auth/sign-up'],
])('%s', (_name, useStart, path) => {
  it('remembers the user and goes to the home page', async () => {
    const fetch = stubFetch(Response.json(ADA))
    const { result } = renderAuthHook(useStart)

    await act(() => result.current.mutateAsync(CREDENTIALS))

    expect(fetch.mock.calls[0][0]).toBe(path)
    expect(queryClient.getQueryData(CURRENT_USER_KEY)).toEqual(ADA)
    expect(router.replace).toHaveBeenCalledWith('/')
  })

  it('stays on the form when the backend says no', async () => {
    stubFetch(Response.json({ detail: 'Wrong email or password.' }, { status: 401 }))
    const { result } = renderAuthHook(useStart)

    await act(() => result.current.mutateAsync(CREDENTIALS).catch(() => {}))

    await waitFor(() => expect(result.current.error?.message).toBe('Wrong email or password.'))
    expect(router.replace).not.toHaveBeenCalled()
  })
})

describe('useSignOut', () => {
  it('forgets everything cached and goes to sign in', async () => {
    const fetch = stubFetch(new Response(null, { status: 204 }))
    queryClient.setQueryData(CURRENT_USER_KEY, ADA)
    const { result } = renderAuthHook(useSignOut)

    await act(() => result.current.mutateAsync())

    expect(fetch.mock.calls[0][0]).toBe('/api/auth/sign-out')
    expect(queryClient.getQueryData(CURRENT_USER_KEY)).toBeUndefined()
    expect(router.replace).toHaveBeenCalledWith('/sign-in')
  })
})
