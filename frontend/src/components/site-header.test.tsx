import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { SiteHeader } from './site-header'

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }))

describe('SiteHeader', () => {
  it.each([
    ['Docs', 'https://github.com/muhammadov-q/team4/tree/develop/docs'],
    ['Source', 'https://github.com/muhammadov-q/team4'],
  ])('opens %s in a new tab', (name, href) => {
    renderWithProviders(<SiteHeader />)

    const link = screen.getByRole('link', { name: `${name} (opens in a new tab)` })
    expect(link).toHaveAttribute('href', href)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toHaveAttribute('data-slot', 'button')
  })

  it('has a sign-out button outside the nav', () => {
    renderWithProviders(<SiteHeader />)

    const signOut = screen.getByRole('button', { name: 'Sign out' })
    expect(screen.getByRole('navigation')).not.toContainElement(signOut)
  })
})
