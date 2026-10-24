import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { AuthButton } from './auth-button'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}))

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('AuthButton', () => {
  it('shows a sign-in link for guests', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ detail: 'Sign in to continue.' }, { status: 401 }))
    )

    renderWithProviders(<AuthButton />)

    expect(await screen.findByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/sign-in')
    expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument()
  })

  it('shows sign out for signed-in users', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({
          id: 1,
          email: 'ada@example.com',
          first_name: 'Ada',
          last_name: 'Lovelace',
        })
      )
    )

    renderWithProviders(<AuthButton />)

    expect(await screen.findByRole('button', { name: 'Sign out' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument()
  })

  it('shows an account error when the backend is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('down', { status: 502 })))

    renderWithProviders(<AuthButton />)

    expect(await screen.findByText('Account unavailable')).toHaveAttribute('role', 'status')
    expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument()
  })
})
