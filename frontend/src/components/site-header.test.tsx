import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SiteHeader } from './site-header'

describe('SiteHeader', () => {
  it.each([
    ['Docs', 'https://github.com/muhammadov-q/team4/tree/develop/docs'],
    ['Source', 'https://github.com/muhammadov-q/team4'],
  ])('opens %s in a new tab', (name, href) => {
    render(<SiteHeader />)

    const link = screen.getByRole('link', { name: `${name} (opens in a new tab)` })
    expect(link).toHaveAttribute('href', href)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toHaveAttribute('data-slot', 'button')
  })
})
