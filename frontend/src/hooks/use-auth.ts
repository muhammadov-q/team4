'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { getCurrentUser, signIn, signOut, signUp, type User } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/client'

export const CURRENT_USER_KEY = ['auth', 'me'] as const

export function useCurrentUser() {
  const router = useRouter()
  const query = useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: ({ signal }) => getCurrentUser(signal),
    retry: false,
  })

  const sessionEnded = query.error instanceof ApiError && query.error.status === 401
  useEffect(() => {
    if (sessionEnded) router.replace('/sign-in')
  }, [sessionEnded, router])

  return query
}

function useStartSession<Input>(start: (input: Input) => Promise<User>) {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: start,
    onSuccess: (user: User) => {
      queryClient.setQueryData(CURRENT_USER_KEY, user)
      router.replace('/')
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
  const router = useRouter()
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.clear()
      router.replace('/sign-in')
    },
  })
}
