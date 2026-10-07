'use client'

import { skipToken, useMutation, useQuery } from '@tanstack/react-query'
import {
  createCaptureSession,
  deleteCaptureSession,
  downloadCaptureImage,
  getCaptureSession,
  uploadCaptureImage,
} from '@/lib/api/capture-sessions'
import { ApiError } from '@/lib/api/client'

const POLL_MS = 1500

export function isSessionGone(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404
}

export function useCreateCaptureSession() {
  return useMutation({ mutationFn: createCaptureSession })
}

export function useDeleteCaptureSession() {
  return useMutation({ mutationFn: deleteCaptureSession })
}

export function useUploadCaptureImage(sessionId: string) {
  return useMutation({ mutationFn: (file: File) => uploadCaptureImage(sessionId, file) })
}

export function useCaptureSession(sessionId: string | null, { poll = false } = {}) {
  return useQuery({
    queryKey: ['capture-session', sessionId],
    queryFn: sessionId ? ({ signal }) => getCaptureSession(sessionId, signal) : skipToken,
    refetchInterval: (query) => (poll && !isSessionGone(query.state.error) ? POLL_MS : false),
    retry: (failures, error) => !isSessionGone(error) && failures < 3,
  })
}

export function useCapturedPhoto(sessionId: string | null, uploadCount: number) {
  return useQuery({
    queryKey: ['capture-photo', sessionId, uploadCount],
    queryFn:
      sessionId && uploadCount > 0
        ? ({ signal }) => downloadCaptureImage(sessionId, uploadCount, signal)
        : skipToken,
    staleTime: Infinity,
    gcTime: 0,
  })
}
