'use client'

import type { UseMutationResult } from '@tanstack/react-query'
import { CircleAlertIcon } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { useId } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSignIn, useSignUp } from '@/hooks/use-auth'
import type { SignUpDetails, User } from '@/lib/api/auth'
import { PasswordInput } from './password-input'

const MIN_PASSWORD_LENGTH = 8
const MAX_NAME_LENGTH = 100

type Mode = 'sign-in' | 'sign-up'

interface FormCopy {
  title: string
  intro: string
  submit: string
  pending: string
  passwordAutoComplete: 'current-password' | 'new-password'
  passwordPlaceholder: string
  switchPrompt: string
  switchLabel: string
  switchHref: Route
}

const COPY: Record<Mode, FormCopy> = {
  'sign-in': {
    title: 'Sign in',
    intro: 'Use the email and password you signed up with.',
    submit: 'Sign in',
    pending: 'Signing in…',
    passwordAutoComplete: 'current-password',
    passwordPlaceholder: 'Your password',
    switchPrompt: 'No account yet?',
    switchLabel: 'Create an account',
    switchHref: '/sign-up',
  },
  'sign-up': {
    title: 'Create an account',
    intro: 'You need an account to read pages. Fields marked * are required.',
    submit: 'Create account',
    pending: 'Creating account…',
    passwordAutoComplete: 'new-password',
    passwordPlaceholder: 'Choose a password',
    switchPrompt: 'Already have an account?',
    switchLabel: 'Sign in',
    switchHref: '/sign-in',
  },
}

export function SignInForm() {
  return <AccountForm mode="sign-in" mutation={useSignIn()} />
}

export function SignUpForm() {
  return <AccountForm mode="sign-up" mutation={useSignUp()} />
}

function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-1">
      <Label htmlFor={htmlFor}>{children}</Label>
      {required && (
        <span aria-hidden className="text-sm leading-none text-muted-foreground">
          *
        </span>
      )}
    </div>
  )
}

function AccountForm({
  mode,
  mutation,
}: {
  mode: Mode
  mutation: UseMutationResult<User, Error, SignUpDetails>
}) {
  const copy = COPY[mode]
  const signingUp = mode === 'sign-up'
  const hintId = useId()
  const errorId = useId()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const field = (name: string) => String(form.get(name))
    mutation.mutate({
      email: field('email'),
      password: field('password'),
      ...(signingUp ? { first_name: field('first_name'), last_name: field('last_name') } : {}),
    })
  }

  const describedBy = [signingUp && hintId, mutation.error && errorId].filter(Boolean).join(' ')

  return (
    <Card className="flex flex-col gap-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{copy.title}</h1>
        <p className="text-muted-foreground">{copy.intro}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {signingUp && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="first_name">First name</FieldLabel>
              <Input
                id="first_name"
                name="first_name"
                autoComplete="given-name"
                placeholder="Ada"
                maxLength={MAX_NAME_LENGTH}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="last_name">Last name</FieldLabel>
              <Input
                id="last_name"
                name="last_name"
                autoComplete="family-name"
                placeholder="Lovelace"
                maxLength={MAX_NAME_LENGTH}
              />
            </div>
          </div>
        )}
        <div className="space-y-2">
          <FieldLabel htmlFor="email" required={signingUp}>
            Email
          </FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="password" required={signingUp}>
            Password
          </FieldLabel>
          <PasswordInput
            id="password"
            name="password"
            autoComplete={copy.passwordAutoComplete}
            placeholder={copy.passwordPlaceholder}
            minLength={signingUp ? MIN_PASSWORD_LENGTH : undefined}
            aria-describedby={describedBy || undefined}
            required
          />
          {signingUp && (
            <p id={hintId} className="text-sm text-muted-foreground">
              At least {MIN_PASSWORD_LENGTH} characters.
            </p>
          )}
        </div>

        {mutation.error && (
          <p
            id={errorId}
            role="alert"
            className="flex items-start gap-2 rounded-xl bg-muted px-4 py-3 text-sm"
          >
            <CircleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
            {mutation.error.message}
          </p>
        )}

        <Button type="submit" size="lg" disabled={mutation.isPending}>
          {mutation.isPending ? copy.pending : copy.submit}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        {copy.switchPrompt}{' '}
        <Link
          href={copy.switchHref}
          className="rounded font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {copy.switchLabel}
        </Link>
      </p>
    </Card>
  )
}
