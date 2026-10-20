import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { SignOutButton } from './sign-out-button'

const router = vi.hoisted(() => ({ replace: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => router }))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  router.replace.mockReset()
})

function stubFetch(response: Response | Promise<Response>) {
  const fetch = vi.fn().mockReturnValue(Promise.resolve(response))
  vi.stubGlobal('fetch', fetch)
  return fetch
}

describe('SignOutButton', () => {
  it('signs out and goes to the sign-in page', async () => {
    const fetch = stubFetch(new Response(null, { status: 204 }))
    renderWithProviders(<SignOutButton />)

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))

    await vi.waitFor(() => expect(router.replace).toHaveBeenCalledWith('/sign-in'))
    expect(fetch.mock.calls[0][0]).toBe('/api/auth/sign-out')
  })

  it('is disabled while signing out', async () => {
    stubFetch(new Promise<Response>(() => {}))
    renderWithProviders(<SignOutButton />)

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(screen.getByRole('button', { name: 'Sign out' })).toBeDisabled()
  })

  it('says so when signing out fails', async () => {
    const error = vi.spyOn(toast, 'error')
    stubFetch(new Response('down', { status: 502 }))
    renderWithProviders(<SignOutButton />)

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))

    await vi.waitFor(() => expect(error).toHaveBeenCalledWith('Could not sign you out. Try again.'))
    expect(router.replace).not.toHaveBeenCalled()
  })
})
