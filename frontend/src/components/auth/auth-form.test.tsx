import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { SignInForm, SignUpForm } from './auth-form'

const router = vi.hoisted(() => ({ replace: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => router }))

afterEach(() => {
  vi.unstubAllGlobals()
  router.replace.mockReset()
})

function stubFetch(response: Response | Promise<Response>) {
  const fetch = vi.fn().mockReturnValue(Promise.resolve(response))
  vi.stubGlobal('fetch', fetch)
  return fetch
}

const sentBody = (fetch: ReturnType<typeof vi.fn>) =>
  JSON.parse((fetch.mock.calls[0] as [string, RequestInit])[1].body as string)

async function fillIn(email: string, password: string) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Password'), password)
  return user
}

describe('SignInForm', () => {
  it('asks for the email and current password and links to sign up', () => {
    const { container } = renderWithProviders(<SignInForm />)

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Email')).toHaveAttribute('placeholder', 'you@example.com')
    const password = screen.getByLabelText('Password')
    expect(password).toHaveAttribute('type', 'password')
    expect(password).toHaveAttribute('autocomplete', 'current-password')
    expect(password).toHaveAttribute('placeholder', 'Your password')
    expect(password).not.toHaveAttribute('minlength')
    expect(screen.queryByLabelText('First name')).not.toBeInTheDocument()
    expect(container).not.toHaveTextContent('*')
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
      'href',
      '/sign-up'
    )
  })

  it('signs in with only the email and password', async () => {
    const fetch = stubFetch(Response.json({ id: 1, email: 'ada@example.com' }))
    renderWithProviders(<SignInForm />)

    const user = await fillIn('ada@example.com', 'correct horse')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await vi.waitFor(() => expect(router.replace).toHaveBeenCalledWith('/'))
    expect(fetch.mock.calls[0][0]).toBe('/api/auth/sign-in')
    expect(sentBody(fetch)).toEqual({ email: 'ada@example.com', password: 'correct horse' })
  })

  it("shows the backend's message and keeps what was typed", async () => {
    stubFetch(Response.json({ detail: 'Wrong email or password.' }, { status: 401 }))
    renderWithProviders(<SignInForm />)

    const user = await fillIn('ada@example.com', 'wrong horse')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Wrong email or password.')
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
      'Wrong email or password.'
    )
    expect(screen.getByLabelText('Email')).toHaveValue('ada@example.com')
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled()
  })

  it('disables the button while signing in', async () => {
    stubFetch(new Promise<Response>(() => {}))
    renderWithProviders(<SignInForm />)

    const user = await fillIn('ada@example.com', 'correct horse')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('button', { name: 'Signing in…' })).toBeDisabled()
  })
})

describe('SignUpForm', () => {
  it('asks for a new password of at least 8 characters and links to sign in', () => {
    renderWithProviders(<SignUpForm />)

    expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument()
    const password = screen.getByLabelText('Password')
    expect(password).toHaveAttribute('autocomplete', 'new-password')
    expect(password).toHaveAttribute('placeholder', 'Choose a password')
    expect(password).toHaveAttribute('minlength', '8')
    expect(password).toHaveAccessibleDescription('At least 8 characters.')
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/sign-in')
  })

  it('marks email and password as required and the names as optional', () => {
    renderWithProviders(<SignUpForm />)

    expect(screen.getByText(/Fields marked \* are required/)).toBeInTheDocument()
    for (const label of ['Email', 'Password']) {
      expect(screen.getByLabelText(label)).toBeRequired()
      expect(screen.getByText(label).nextElementSibling).toHaveTextContent('*')
    }
    for (const [label, placeholder] of [
      ['First name', 'Ada'],
      ['Last name', 'Lovelace'],
    ]) {
      const input = screen.getByLabelText(label)
      expect(input).not.toBeRequired()
      expect(input).toHaveAttribute('placeholder', placeholder)
      expect(input).toHaveAttribute('maxlength', '100')
      expect(screen.getByText(label).nextElementSibling).toBeNull()
    }
  })

  it('creates the account with the names and goes to the home page', async () => {
    const fetch = stubFetch(Response.json({ id: 1, email: 'ada@example.com' }, { status: 201 }))
    renderWithProviders(<SignUpForm />)

    const user = await fillIn('ada@example.com', 'correct horse')
    await user.type(screen.getByLabelText('First name'), 'Ada')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    await vi.waitFor(() => expect(router.replace).toHaveBeenCalledWith('/'))
    expect(fetch.mock.calls[0][0]).toBe('/api/auth/sign-up')
    expect(sentBody(fetch)).toEqual({
      email: 'ada@example.com',
      password: 'correct horse',
      first_name: 'Ada',
      last_name: '',
    })
  })

  it('describes the password with both the hint and the error', async () => {
    stubFetch(
      Response.json({ detail: 'An account with this email already exists.' }, { status: 409 })
    )
    renderWithProviders(<SignUpForm />)

    const user = await fillIn('ada@example.com', 'correct horse')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    await screen.findByRole('alert')
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
      'At least 8 characters. An account with this email already exists.'
    )
  })
})
