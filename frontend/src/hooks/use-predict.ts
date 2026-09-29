'use client'

import { useMutation } from '@tanstack/react-query'
import { predictImage, type PredictResponse } from '@/lib/api/predict'

export interface PredictResult {
  response: PredictResponse
  durationMs: number
}

export function usePredict() {
  return useMutation({
    mutationKey: ['predict'],
    mutationFn: async ({
      file,
      signal,
    }: {
      file: File
      signal?: AbortSignal
    }): Promise<PredictResult> => {
      const startedAt = performance.now()
      const response = await predictImage(file, signal)
      return { response, durationMs: performance.now() - startedAt }
    },
  })
}
