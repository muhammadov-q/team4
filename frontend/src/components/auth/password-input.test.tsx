import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PasswordInput } from './password-input'

describe('PasswordInput', () => {
  it('hides the password until you ask to see it', async () => {
    render(
      <>
        <label htmlFor="password">Password</label>
        <PasswordInput id="password" defaultValue="correct horse" />
      </>
    )
    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'password')

    await userEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveValue('correct horse')

    const hide = screen.getByRole('button', { name: 'Hide password' })
    expect(hide).toHaveAttribute('aria-controls', 'password')
    await userEvent.click(hide)
    expect(input).toHaveAttribute('type', 'password')
  })

  it('does not submit the form it sits in', async () => {
    let submitted = false
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault()
          submitted = true
        }}
      >
        <PasswordInput aria-label="Password" />
      </form>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Show password' }))

    expect(submitted).toBe(false)
  })
})
