import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DashboardMenu } from './dashboard-menu'

vi.mock('@/components/auth/signed-in-as', () => ({
  SignedInAs: () => <span>Signed in as Ena</span>,
}))

vi.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <button>Switch theme</button>,
}))

describe('DashboardMenu', () => {
  it('shows Team4 while the sidebar is closed', () => {
    render(<DashboardMenu />)

    expect(screen.getByRole('link', { name: 'Team4' })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('button', { name: 'Open navigation' })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('opens on hover and closes when the pointer leaves', () => {
    render(<DashboardMenu />)

    const container = screen.getByRole('link', { name: 'Team4' }).parentElement!.parentElement!

    fireEvent.mouseEnter(container)
    expect(screen.getByRole('navigation')).toBeInTheDocument()

    fireEvent.mouseLeave(container)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('keeps the menu open after clicking and closes on a second click', () => {
    render(<DashboardMenu />)

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }))

    const container = screen.getByRole('link', { name: 'Team4' }).parentElement!.parentElement!

    fireEvent.mouseLeave(container)
    expect(screen.getByRole('navigation')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close navigation' }))
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('opens with the keyboard and closes with Escape', () => {
    render(<DashboardMenu />)

    const button = screen.getByRole('button', { name: 'Open navigation' })
    button.focus()

    // A native button also receives click when activated by keyboard.
    fireEvent.click(button)
    fireEvent.keyDown(button, { key: 'Escape' })

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(button).toHaveFocus()
  })

  it('provides the Read, Docs and Source links', () => {
    render(<DashboardMenu />)
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }))

    expect(screen.getByRole('link', { name: 'Read' })).toHaveAttribute('href', '/dashboard')

    for (const name of ['Docs', 'Source']) {
      const link = screen.getByRole('link', {
        name: new RegExp(`^${name}\\s*\\(opens in a new tab\\)$`),
      })
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }

    expect(screen.getByRole('button', { name: 'Switch theme' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: 'Read' }))
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
