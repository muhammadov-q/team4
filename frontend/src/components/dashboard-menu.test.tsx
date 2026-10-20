import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DashboardMenu } from './dashboard-menu'

const navigation = vi.hoisted(() => ({ pathname: '/dashboard' }))
vi.mock('next/navigation', () => ({ usePathname: () => navigation.pathname }))

vi.mock('@/components/auth/signed-in-as', () => ({
  SignedInAs: () => <span>Signed in as Ena</span>,
}))

vi.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <button>Switch theme</button>,
}))

beforeEach(() => {
  navigation.pathname = '/dashboard'
})

describe('DashboardMenu', () => {
  it('starts expanded with the user information visible', () => {
    render(<DashboardMenu />)

    expect(screen.getByText('Signed in as Ena')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Team4' })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('button', { name: 'Collapse navigation' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
  })

  it('collapses to icons while keeping navigation accessible', async () => {
    const user = userEvent.setup()
    render(<DashboardMenu />)

    await user.click(screen.getByRole('button', { name: 'Collapse navigation' }))

    expect(screen.queryByText('Signed in as Ena')).not.toBeInTheDocument()
    expect(screen.queryByText('Read')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Read' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Expand navigation' })).toHaveAttribute(
      'aria-expanded',
      'false'
    )

    await user.click(screen.getByRole('button', { name: 'Expand navigation' }))

    expect(screen.getByText('Signed in as Ena')).toBeVisible()
    expect(screen.getByText('Read')).toBeVisible()
  })

  it('does not expand the collapsed sidebar on hover', () => {
    render(<DashboardMenu />)

    fireEvent.click(screen.getByRole('button', { name: 'Collapse navigation' }))

    fireEvent.mouseEnter(screen.getByRole('complementary'))
    fireEvent.mouseLeave(screen.getByRole('complementary'))

    expect(screen.getByRole('button', { name: 'Expand navigation' })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })

  it('supports keyboard toggling', async () => {
    const user = userEvent.setup()
    render(<DashboardMenu />)

    await user.tab()
    expect(screen.getByRole('button', { name: 'Collapse navigation' })).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(screen.getByRole('button', { name: 'Expand navigation' })).toHaveFocus()

    await user.keyboard(' ')
    expect(screen.getByRole('button', { name: 'Collapse navigation' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
  })

  it('provides navigation links and theme switching', () => {
    render(<DashboardMenu />)

    expect(screen.getByRole('link', { name: 'Read' })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('link', { name: 'Read' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'History' })).toHaveAttribute(
      'href',
      '/dashboard/history'
    )
    expect(screen.getByRole('link', { name: 'History' })).not.toHaveAttribute('aria-current')

    const links = [
      ['Docs', 'https://github.com/muhammadov-q/team4/tree/develop/docs'],
      ['Source', 'https://github.com/muhammadov-q/team4'],
    ]

    for (const [name, href] of links) {
      const link = screen.getByRole('link', {
        name: `${name} (opens in a new tab)`,
      })

      expect(link).toHaveAttribute('href', href)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }

    expect(screen.getByRole('button', { name: 'Switch theme' })).toBeVisible()
  })

  it.each(['/dashboard/history', '/dashboard/history/3'])(
    'marks History as the page on %s',
    (path) => {
      navigation.pathname = path
      render(<DashboardMenu />)

      expect(screen.getByRole('link', { name: 'History' })).toHaveAttribute('aria-current', 'page')
      expect(screen.getByRole('link', { name: 'Read' })).not.toHaveAttribute('aria-current')
    }
  )
})
