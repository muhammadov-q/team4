import { apiRequest } from './client'
import type { paths } from './schema'

type SignUpOperation = paths['/auth/sign-up']['post']
type SignInOperation = paths['/auth/sign-in']['post']

export type SignUpDetails = SignUpOperation['requestBody']['content']['application/json']
export type Credentials = SignInOperation['requestBody']['content']['application/json']
export type User = paths['/auth/me']['get']['responses'][200]['content']['application/json']

export function signUp(details: SignUpDetails): Promise<User> {
  return apiRequest<User>('/auth/sign-up', {
    method: 'POST',
    body: details,
    fallback: 'Could not create your account. Try again.',
  })
}

export function signIn(credentials: Credentials): Promise<User> {
  return apiRequest<User>('/auth/sign-in', {
    method: 'POST',
    body: credentials,
    fallback: 'Could not sign you in. Try again.',
  })
}

export function signOut(): Promise<void> {
  return apiRequest<void>('/auth/sign-out', {
    method: 'POST',
    fallback: 'Could not sign you out. Try again.',
  })
}

export function getCurrentUser(signal?: AbortSignal): Promise<User> {
  return apiRequest<User>('/auth/me', { signal, fallback: 'Could not load your account.' })
}
