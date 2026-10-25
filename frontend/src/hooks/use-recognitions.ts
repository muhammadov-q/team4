'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api/client'
import { predictPage, type Prediction } from '@/lib/api/predict'
import { getRecognition, listRecognitions, recognizePage } from '@/lib/api/recognitions'
import { CURRENT_USER_KEY } from './use-auth'
import type { User } from '@/lib/api/auth'

export const RECOGNITIONS_KEY = ['recognitions'] as const

export interface RecognizeResult {
  recognition: Prediction
  durationMs: number
  savedId?: number
}

export function useRecognize() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['recognize'],
    mutationFn: async ({
      file,
      signal,
    }: {
      file: File
      signal?: AbortSignal
    }): Promise<RecognizeResult> => {
      const startedAt = performance.now()
      const currentUser = queryClient.getQueryData<User | null>(CURRENT_USER_KEY)

      if (currentUser === null) {
        const prediction = await predictPage(file, signal)

        return {
          recognition: prediction,
          durationMs: performance.now() - startedAt,
        }
      }

      try {
        const recognition = await recognizePage(file, signal)

        return {
          recognition,
          savedId: recognition.id,
          durationMs: performance.now() - startedAt,
        }
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) {
          throw error
        }

        await queryClient.cancelQueries({ queryKey: CURRENT_USER_KEY })
        queryClient.setQueryData(CURRENT_USER_KEY, null)

        const prediction = await predictPage(file, signal)

        return {
          recognition: prediction,
          durationMs: performance.now() - startedAt,
        }
      }
    },
    onSuccess: (result) => {
      if (result.savedId !== undefined) {
        void queryClient.invalidateQueries({ queryKey: RECOGNITIONS_KEY })
      }
    },
  })
}

export function useRecognitions() {
  return useQuery({
    queryKey: RECOGNITIONS_KEY,
    queryFn: ({ signal }) => listRecognitions(signal),
    retry: false,
  })
}

export function useRecognition(id: number) {
  return useQuery({
    queryKey: [...RECOGNITIONS_KEY, id],
    queryFn: ({ signal }) => getRecognition(id, signal),
    retry: false,
  })
}
