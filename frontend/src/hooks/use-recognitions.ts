'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getRecognition,
  listRecognitions,
  recognizePage,
  type Recognition,
} from '@/lib/api/recognitions'

export const RECOGNITIONS_KEY = ['recognitions'] as const

export interface RecognizeResult {
  recognition: Recognition
  durationMs: number
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
      const recognition = await recognizePage(file, signal)
      return { recognition, durationMs: performance.now() - startedAt }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RECOGNITIONS_KEY })
    },
  })
}

export function useRecognitions() {
  return useQuery({
    queryKey: RECOGNITIONS_KEY,
    queryFn: ({ signal }) => listRecognitions(signal),
  })
}

export function useRecognition(id: number) {
  return useQuery({
    queryKey: [...RECOGNITIONS_KEY, id],
    queryFn: ({ signal }) => getRecognition(id, signal),
    retry: false,
  })
}
