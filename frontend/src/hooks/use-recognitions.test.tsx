import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeRecognition } from '@/test/recognitions'
import { useRecognitions, useRecognize } from './use-recognitions'

afterEach(() => {
  vi.unstubAllGlobals()
})

function renderWithClient<T>(hook: () => T) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return renderHook(hook, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useRecognize', () => {
  it('refreshes the history after reading a page', async () => {
    const first = makeRecognition({ id: 1 })
    const second = makeRecognition({ id: 2 })
    const history = [first]
    const fetch = vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method !== 'POST') return Response.json(history)
      history.unshift(second)
      return Response.json(second)
    })
    vi.stubGlobal('fetch', fetch)

    const { result } = renderWithClient(() => ({
      history: useRecognitions(),
      recognize: useRecognize(),
    }))
    await waitFor(() => expect(result.current.history.data).toEqual([first]))

    await act(() =>
      result.current.recognize.mutateAsync({
        file: new File(['x'], 'folio-2r.png', { type: 'image/png' }),
      })
    )

    await waitFor(() => expect(result.current.history.data).toEqual([second, first]))
    expect(result.current.recognize.data?.recognition).toEqual(second)
  })
})
