import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { SignedInAs } from './signed-in-as'

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }))

afterEach(() => {
  vi.unstubAllGlobals()
})

const ADA = { id: 1, email: 'ada@example.com', first_name: null, last_name: null }

function stubFetch(response: Response | Promise<Response>) {
  const fetch = vi.fn().mockReturnValue(Promise.resolve(response))
  vi.stubGlobal('fetch', fetch)
  return fetch
}

describe('SignedInAs', () => {
  it('holds the place of the name while it loads', () => {
    stubFetch(new Promise<Response>(() => {}))
    const { container } = renderWithProviders(<SignedInAs />)

    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
  })

  it('shows the name when one was given', async () => {
    stubFetch(Response.json({ ...ADA, first_name: 'Ada', last_name: 'Lovelace' }))
    renderWithProviders(<SignedInAs />)

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText(/Signed in as/)).toHaveTextContent('Signed in as Ada Lovelace')
  })

  it('falls back to the email', async () => {
    stubFetch(Response.json(ADA))
    renderWithProviders(<SignedInAs />)

    expect(await screen.findByText('ada@example.com')).toBeInTheDocument()
  })

  it('shows nothing when the account cannot be loaded', async () => {
    const fetch = stubFetch(new Response('down', { status: 502 }))
    const { container } = renderWithProviders(<SignedInAs />)

    await vi.waitFor(() => expect(fetch).toHaveBeenCalled())
    await vi.waitFor(() => expect(container).toBeEmptyDOMElement())
  })
})
