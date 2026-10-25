'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { getCurrentUser, signIn, signOut, signUp, type User } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/client'

export const CURRENT_USER_KEY = ['auth', 'me'] as const

export function useCurrentUser() {
  return useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: async ({ signal }) => {
      try {
        return await getCurrentUser(signal)
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null
        throw error
      }
    },
    retry: false,
  })
}

function useStartSession<Input>(start: (input: Input) => Promise<User>) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: start,
    onSuccess: (user: User) => {
      queryClient.removeQueries()
      queryClient.setQueryData(CURRENT_USER_KEY, user)
      router.replace('/dashboard')
    },
  })
}

export function useSignIn() {
  return useStartSession(signIn)
}

export function useSignUp() {
  return useStartSession(signUp)
}

export function useSignOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: signOut,
    onSuccess: async () => {
      await queryClient.cancelQueries()

      queryClient.removeQueries({
        predicate: (query) =>
          !(query.queryKey[0] === CURRENT_USER_KEY[0] && query.queryKey[1] === CURRENT_USER_KEY[1]),
      })

      queryClient.setQueryData(CURRENT_USER_KEY, null)
      // Reload the page to clear local image and recognition state after sign-out.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign('/dashboard')
    },
  })
}
