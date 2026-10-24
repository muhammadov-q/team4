import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { AccountCard } from './account-card'

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

describe('AccountCard', () => {
  it('holds the place of the account while it loads', () => {
    stubFetch(new Promise<Response>(() => {}))
    const { container } = renderWithProviders(<AccountCard expanded />)

    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
  })

  it('shows the name, email and initials when a name was given', async () => {
    stubFetch(Response.json({ ...ADA, first_name: 'Ada', last_name: 'Lovelace' }))
    renderWithProviders(<AccountCard expanded />)

    expect(await screen.findByText('Ada Lovelace')).toHaveTextContent('Signed in as Ada Lovelace')
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(screen.getByText('AL')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
  })

  it('falls back to the email once', async () => {
    stubFetch(Response.json(ADA))
    renderWithProviders(<AccountCard expanded={false} />)

    expect(await screen.findByText('ada@example.com')).toHaveTextContent(
      'Signed in as ada@example.com'
    )
    expect(screen.getAllByText(/ada@example\.com/)).toHaveLength(1)
    expect(screen.getByText('a')).toBeInTheDocument()
  })

  it('keeps sign out when the account cannot be loaded', async () => {
    stubFetch(new Response('down', { status: 502 }))
    renderWithProviders(<AccountCard expanded />)

    expect(await screen.findByRole('button', { name: 'Sign out' })).toBeInTheDocument()
    expect(screen.queryByText(/Signed in as/)).not.toBeInTheDocument()
  })
})
